import { MessageSquare, Phone, Mail } from 'lucide-react';

export default function ContactSection() {
  return (
    <div className="bg-[#062832] py-16 px-6 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-white text-5xl font-bold mb-6 leading-tight">Get help or contact us</h2>
          <p className="text-white text-lg leading-relaxed">
            Choose the best option to suit your needs. Or explore other ways to{' '}
            <a href="#" className="text-[#14bfd8] hover:text-white underline">
              get help
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#083d47] p-8 hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6">
              <MessageSquare className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>

            <h3 className="text-white text-2xl font-bold mb-4">Send us a message</h3>

            <p className="text-gray-300 text-base mb-4 leading-relaxed">
              Have a question or need assistance? Send us a message and our team will get back to you as soon as possible.
            </p>

            <p className="text-gray-400 text-sm mb-6">
              We typically respond within 24 hours during business days.
            </p>

            <a
              href="#"
              className="inline-flex items-center text-[#14bfd8] hover:text-white transition-colors text-base font-medium"
            >
              Send a message →
            </a>
          </div>

          <div className="bg-[#083d47] p-8 hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6">
              <Phone className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>

            <h3 className="text-white text-2xl font-bold mb-4">Call us</h3>

            <p className="text-gray-300 text-base mb-4 leading-relaxed">
              If you have any questions, you can speak to a lending specialist on{' '}
              <a href="tel:03457345345" className="text-[#14bfd8] hover:text-white font-semibold">
                0345 734 5345
              </a>
            </p>

            <p className="text-gray-400 text-sm mb-6">
              We're here Monday to Saturday from 8am to 9pm, and bank holidays from 8am to 6pm.{' '}
              <a href="#" className="text-[#14bfd8] hover:text-white underline">
                Call charges
              </a>
            </p>
          </div>

          <div className="bg-[#083d47] p-8 hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6">
              <Mail className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>

            <h3 className="text-white text-2xl font-bold mb-4">Email us</h3>

            <p className="text-gray-300 text-base mb-4 leading-relaxed">
              Prefer email? Send your inquiry to our support team and we'll respond within 1-2 business days.
            </p>

            <p className="text-gray-400 text-sm mb-6">
              Please include your account details for faster assistance.
            </p>

            <a
              href="mailto:support@example.com"
              className="inline-flex items-center text-[#14bfd8] hover:text-white transition-colors text-base font-medium"
            >
              Send an email →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
