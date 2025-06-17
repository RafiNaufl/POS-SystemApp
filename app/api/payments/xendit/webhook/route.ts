import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Verify Xendit webhook signature
function verifyWebhookSignature(rawBody: string, signature: string, webhookToken: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', webhookToken)
    .update(rawBody)
    .digest('hex')
  
  return computedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-callback-token') || ''
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN || ''

    // Verify webhook signature (optional in development)
    if (process.env.NODE_ENV === 'production' && webhookToken) {
      if (!verifyWebhookSignature(rawBody, signature, webhookToken)) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const webhookData = JSON.parse(rawBody)
    console.log('Xendit webhook received:', webhookData)

    // Handle different webhook events
    const { event, data } = webhookData

    if (event === 'ewallet.charge.succeeded') {
      await handleSuccessfulPayment(data)
    } else if (event === 'ewallet.charge.failed') {
      await handleFailedPayment(data)
    } else if (event === 'ewallet.charge.pending') {
      await handlePendingPayment(data)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference_id, id: charge_id, amount, metadata } = data
    const transactionId = metadata?.transaction_id

    if (!transactionId) {
      console.error('No transaction ID found in webhook metadata')
      return
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    })

    if (existingTransaction) {
      // Update existing transaction status
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: 'PAID',
          xenditChargeId: charge_id,
          xenditReferenceId: reference_id,
          paidAt: new Date(),
          status: 'COMPLETED'
        }
      })
      console.log(`Existing transaction ${transactionId} marked as paid`)
    } else {
      // Transaction doesn't exist yet, we need to create it
      // This should not happen in normal flow, but we'll handle it
      console.warn(`Transaction ${transactionId} not found, cannot complete payment`)
    }

  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference_id, id: charge_id, failure_code, metadata } = data
    const transactionId = metadata?.transaction_id

    if (!transactionId) {
      console.error('No transaction ID found in webhook metadata')
      return
    }

    // Update transaction status in database
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: 'FAILED',
        xenditChargeId: charge_id,
        xenditReferenceId: reference_id,
        failureReason: failure_code
      }
    })

    console.log(`Transaction ${transactionId} marked as failed: ${failure_code}`)

  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

async function handlePendingPayment(data: any) {
  try {
    const { reference_id, id: charge_id, metadata } = data
    const transactionId = metadata?.transaction_id

    if (!transactionId) {
      console.error('No transaction ID found in webhook metadata')
      return
    }

    // Update transaction status in database
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: 'PENDING',
        xenditChargeId: charge_id,
        xenditReferenceId: reference_id
      }
    })

    console.log(`Transaction ${transactionId} marked as pending`)

  } catch (error) {
    console.error('Error handling pending payment:', error)
  }
}