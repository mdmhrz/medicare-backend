/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    // check existing payment

    const existingPayment = await prisma.payment.findUnique({
        where: {
            stripeEventId: event.id,
        }
    });

    if (existingPayment) {
        console.log(`Payment with id ${event.id} already processed. Skiping...`);
        return { message: `Payment with id ${event.id} already processed.` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            if (!appointmentId || !paymentId) {
                console.log("Missing required metadata");
                return { message: "Missing appointmentId or paymentId" };
            }

            const appointment = await prisma.appointment.findUnique({
                where: {
                    id: appointmentId,
                },
            });

            if (!appointment) {
                console.log("Appointment not found");
                return { message: "Appointment not found" };
            }

            await prisma.$transaction(async (tx) => {
                await tx.appointment.update({
                    where: {
                        id: appointmentId,
                    },
                    data: {
                        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                    },
                });


                await tx.payment.update({
                    where: {
                        id: paymentId,
                    },
                    data: {
                        stripeEventId: event.id,
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session.payment_status === "paid" ? session as any : null,
                    },
                })
            })

            console.log(`Payment with id ${paymentId} processed successfully.`);

            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log(`Payment with id ${session.metadata?.paymentId} expired.`);

            break
        }
        case "payment_intent.payment_failed": {
            const session = event.data.object as Stripe.PaymentIntent;

            console.log(`Payment with id ${session.metadata?.paymentId} failed.`);

            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return { message: `Webhook event ${event.id} processed successfully.` };
};



export const PaymentService = {
    handleStripeWebhookEvent
}