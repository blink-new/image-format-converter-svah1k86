
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border-t border-gray-200 py-8 mt-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">ImageConvert.io</h3>
            <p className="text-sm text-gray-600">
              The fastest way to convert and optimize your images. Built with love for creators worldwide.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Features</li>
              <li>Pricing</li>
              <li>Use Cases</li>
              <li>API</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Documentation</li>
              <li>Blog</li>
              <li>Support</li>
              <li>Status</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-600 text-center">
          © 2024 ImageConvert.io. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}