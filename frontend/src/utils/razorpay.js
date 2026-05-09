// Razorpay browser SDK is loaded dynamically via loadRazorpayScript() → window.Razorpay

/**
 * Initiate a Razorpay checkout.
 * @param {Object} options
 * @param {string} options.orderId       - Razorpay order_id from backend
 * @param {number} options.amount        - Amount in INR (will be shown as ₹amount)
 * @param {string} options.keyId         - Razorpay key_id from backend
 * @param {Object} options.prefill       - { name, email, contact }
 * @param {string} options.description   - Payment description
 * @param {Function} options.onSuccess   - Called with Razorpay response on payment success
 * @param {Function} options.onDismiss   - Called when modal is closed without payment
 */
export const openRazorpayCheckout = ({ orderId, amount, keyId, prefill, description, onSuccess, onDismiss }) => {
    const options = {
        key: keyId,
        amount: amount * 100, // Razorpay expects paise
        currency: 'INR',
        name: 'Ad Agency Portal',
        description: description || 'Ad Campaign Payment',
        image: '/logo.png',
        order_id: orderId,
        prefill: prefill || {},
        notes: {
            address: 'Ad Agency Management Portal',
        },
        theme: {
            color: '#6366f1',
        },
        handler: (response) => {
            if (onSuccess) onSuccess(response);
        },
        modal: {
            ondismiss: () => {
                if (onDismiss) onDismiss();
            },
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response.error);
    });
    rzp.open();
};

/**
 * Dynamically load Razorpay SDK script
 */
export const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
