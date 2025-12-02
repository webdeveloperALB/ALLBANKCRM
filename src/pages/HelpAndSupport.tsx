import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Phone, Mail, MessageSquare } from 'lucide-react';

export default function HelpAndSupport() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="w-full bg-[#083d47] text-white py-20 border-l-4 border-[#14bfd8]">
        <div className="w-full px-16">
          <h1 className="text-5xl font-bold mb-6">Help and Support</h1>
          <p className="text-xl max-w-3xl">
            We're here to help you with whatever you need. Find answers, get in touch, or explore our resources.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#0a7f8f] flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Call Us</h3>
            <p className="text-gray-600 mb-4">
              Speak to our support team 24/7
            </p>
            <p className="text-[#0a7f8f] font-semibold">0800 123 4567</p>
          </div>

          <div className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#0a7f8f] flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Chat with us online for instant help
            </p>
            <button className="text-[#0a7f8f] font-semibold hover:underline">
              Start chat
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#0a7f8f] flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Us</h3>
            <p className="text-gray-600 mb-4">
              Send us a message and we'll respond within 24 hours
            </p>
            <a href="mailto:support@bank.com" className="text-[#0a7f8f] font-semibold hover:underline">
              support@bank.com
            </a>
          </div>
        </div>

        <div className="bg-gray-50 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-[#0a7f8f] transition-colors">
                How do I reset my online banking password?
              </summary>
              <p className="mt-3 text-gray-600 pl-4">
                You can reset your password by clicking "Forgot Password" on the login page and following the instructions sent to your registered email address.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-[#0a7f8f] transition-colors">
                What should I do if I suspect fraud on my account?
              </summary>
              <p className="mt-3 text-gray-600 pl-4">
                Contact us immediately on 0800 123 4567 (available 24/7). We'll help you secure your account and investigate any suspicious activity.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-[#0a7f8f] transition-colors">
                How long does it take to transfer money between accounts?
              </summary>
              <p className="mt-3 text-gray-600 pl-4">
                Internal transfers between your accounts are instant. Transfers to other banks typically take 1-2 business days.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-[#0a7f8f] transition-colors">
                Can I increase my credit card limit?
              </summary>
              <p className="mt-3 text-gray-600 pl-4">
                Yes, you can request a credit limit increase through online banking or by contacting our customer service team. We'll review your request based on your account history.
              </p>
            </details>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
