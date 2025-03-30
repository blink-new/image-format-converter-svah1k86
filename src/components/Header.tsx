
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200"
    >
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold">IC</span>
            </motion.div>
            <span className="text-xl font-semibold">ImageConvert.io</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="w-4 h-4" />
                Star on GitHub
              </Button>
            </a>
            <Button size="sm">Sign In</Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}