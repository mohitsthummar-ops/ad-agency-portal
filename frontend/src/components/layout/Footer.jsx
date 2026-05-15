import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
    Company: [
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
        { to: '/privacy-policy', label: 'Privacy Policy' },
        { to: '/terms', label: 'Terms & Conditions' },
    ],
    Services: [
        { to: '/campaign-templates', label: 'Campaign Templates' },
        { to: '/#categories', label: 'Ad Categories' },
        { to: '/register', label: 'Start Campaign' },
        { to: '/login', label: 'Client Portal' },
        { to: '/contact', label: 'Get a Quote' },
    ],
};

const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
];

export default function Footer() {
    return (
        <footer className="border-t border-[rgba(99,102,241,0.1)] bg-[#080b14]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.jpg"
                                alt="Ads Agency Logo"
                                className="h-10 w-auto object-contain brightness-0 invert"
                            />
                            <span style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-lg gradient-text">Ads Agency</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-5">
                            A modern platform to manage, track, and grow your advertisement campaigns with precision.
                        </p>
                        <div className="flex items-center gap-3">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Groups */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <div key={group}>
                            <h3 className="text-white font-semibold text-sm mb-4">{group}</h3>
                            <ul className="space-y-2.5">
                                {links.map((l) => (
                                    <li key={l.label}>
                                        <Link
                                            to={l.to}
                                            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-slate-500 text-sm">
                                <Mail className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                                adagency@gmail.com
                            </li>
                            <li className="flex items-start gap-2.5 text-slate-500 text-sm">
                                <Phone className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                                +91 63539 60833
                            </li>
                            <li className="flex items-start gap-2.5 text-slate-500 text-sm">
                                <MapPin className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                                Maliba Campus, Bardoli, Gujarat.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-[rgba(99,102,241,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-sm">
                        © {new Date().getFullYear()} Ads Agency. All rights reserved.
                    </p>
                    <p className="text-slate-600 text-sm">
                        Built with ❤️ using the MERN Stack
                    </p>
                </div>
            </div>
        </footer>
    );
}
