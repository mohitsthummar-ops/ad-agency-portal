import { motion } from 'framer-motion';

const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using the AdAgency Portal, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.' },
    { title: '2. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. You must be at least 13 years old to use this service.' },
    { title: '3. Permitted Use', content: 'You may use our platform only for lawful purposes. You agree not to upload false, misleading, or inappropriate content. Ads must comply with our content guidelines and all applicable laws.' },
    { title: '4. Ad Content Policy', content: 'All advertisements are reviewed before being published. We reserve the right to reject or remove any ad that violates our policies, including but not limited to ads promoting illegal activity, adult content, or hate speech.' },
    { title: '5. Payments & Refunds', content: 'Payments are processed via Razorpay. All transactions are final unless otherwise stated. Refund requests must be submitted within 7 days and are subject to review at our discretion.' },
    { title: '6. Intellectual Property', content: 'All content, logos, and technology on this platform are the property of AdAgency Portal. Users retain ownership of content they upload but grant us a license to display it within the platform.' },
    { title: '7. Limitation of Liability', content: 'AdAgency Portal is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our maximum liability is limited to the amount paid for our services.' },
    { title: '8. Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms. Users may close their accounts at any time through Profile Settings.' },
    { title: '9. Changes', content: 'We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.' },
];

export default function Terms() {
    return (
        <div className="pt-12 pb-24 px-4 max-w-4xl mx-auto relative">
            {/* Light elegant background accents */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none transform translate-y-[-20%]"></div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Conditions</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: February 2026</p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 md:p-12 space-y-10 relative overflow-hidden">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-indigo-400"></div>

                    <p className="text-slate-600 text-lg leading-relaxed font-medium pb-6 border-b border-slate-100">
                        Please read these Terms & Conditions carefully before using the AdAgency Portal. These terms govern your use of our platform and services.
                    </p>

                    <div className="space-y-8">
                        {sections.map(({ title, content }) => (
                            <div key={title} className="group">
                                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h2>
                                <p className="text-slate-600 leading-relaxed font-medium">{content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
