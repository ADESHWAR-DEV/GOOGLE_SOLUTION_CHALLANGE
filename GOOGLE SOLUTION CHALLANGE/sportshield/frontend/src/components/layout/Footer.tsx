import Link from 'next/link'
import { Shield, Twitter, Github, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  product: [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/verify', label: 'Verify Content' },
    { href: '/pricing', label: 'Pricing' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  resources: [
    { href: '/docs', label: 'Documentation' },
    { href: '/api', label: 'API Reference' },
    { href: '/status', label: 'System Status' },
    { href: '/support', label: 'Support' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/cookies', label: 'Cookie Policy' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/sportshield', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/sportshield', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/sportshield', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@sportshield.io', label: 'Email' },
]

export function Footer() {
  return (
    <footer className="bg-sport-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-display">SportShield</span>
            </Link>
            <p className="text-sport-gray text-sm mb-6 max-w-xs">
              The first comprehensive platform for protecting athlete content using AI, blockchain, and C2PA authenticity.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-sport-gray hover:text-primary-400 hover:border-primary-500/50 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sport-gray text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sport-gray text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sport-gray text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sport-gray text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sport-gray text-sm">
            © {new Date().getFullYear()} SportShield. All rights reserved.
          </p>
          <p className="text-sport-gray text-sm">
            Built for Google Solution Challenge 2024
          </p>
        </div>
      </div>
    </footer>
  )
}