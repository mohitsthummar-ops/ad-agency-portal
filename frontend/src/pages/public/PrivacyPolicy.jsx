import { motion } from 'framer-motion';

const sections = [
    { title: '1. Information We Collect', content: 'We collect information you provide directly, such as name, email, phone number, and preferences when you register and use our platform. We also collect usage data and analytics information.' },
    { title: '2. How We Use Your Information', content: 'We use your information to provide and improve our services, personalize your ad experience based on preferences, process payments, send relevant communications, and ensure platform security.' },
    { title: '3. Data Sharing', content: 'We do not sell your personal data. We may share data with trusted service providers (payment processors, hosting), legal authorities when required, or business successors in case of merger or acquisition.' },
    { title: '4. Cookies', content: 'We use cookies and localStorage to remember your session, preferences, and improve your experience. You can control cookie settings through your browser, though some features may not function without them.' },
    { title: '5. Data Security', content: 'We implement industry-standard security measures including HTTPS encryption, password hashing (bcrypt), and JWT-based authentication to protect your data.' },
    { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal information. You can also withdraw consent for data processing by contacting us or deleting your account.' },
    { title: '7. Contact Us', content: 'If you have questions about this Privacy Policy, contact us at privacy@adagency.com or through our Contact page.' },
];

export default function PrivacyPolicy() {
    return (
        <div className="pt-12 pb-24 px-4 max-w-4xl mx-auto relative">
            {/* Light elegant background accents */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-50 pointer-events-none transform translate-y-[-20%]"></div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600">Policy</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: February 2026</p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 md:p-12 space-y-10 relative overflow-hidden">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600"></div>

                    <p className="text-slate-600 text-lg leading-relaxed font-medium pb-6 border-b border-slate-100">
                        At AdAgency Portal, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
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
