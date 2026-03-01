/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(
    async (req: Request, res: Response) => {
        const signature = req.headers['stripe-signature'] as string;

        const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.log(`Missing signature or webhook secret`);
            return res.status(status.BAD_REQUEST).json({ message: "Missing signature" });
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        } catch (error: any) {
            console.log(`Webhook signature verification failed: ${error.message}`);
            return res.status(status.BAD_REQUEST).json({ message: "Invalid signature" });
        }


        try {
            const result = await PaymentService.handleStripeWebhookEvent(event);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: result.message || "Stripe webhook event processed successfully",
                data: result
            })
        } catch (error) {
            console.log(`Error processing Stripe webhook event: ${error}`);
            sendResponse(res, {
                httpStatusCode: status.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Error processing Stripe webhook event",
            })
        }




    }
)

export const PaymentController = {
    handleStripeWebhookEvent
}