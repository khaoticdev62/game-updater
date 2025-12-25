import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Copy } from 'lucide-react';

interface ResponseDisplayProps {
  response: string;
  isLoading?: boolean;
}

/**
 * ResponseDisplay Component
 *
 * Formats and displays command responses in a user-friendly way.
 * Automatically detects response type and applies appropriate formatting.
 *
 * Features:
 * - Smart response type detection (success, error, info)
 * - Color-coded message display
 * - Command operation count display
 * - File size formatting
 * - Copy to clipboard functionality
 * - Loading state
 * - Smooth animations
 *
 * Formats recognized:
 * - Success messages (✓, successful, complete)
 * - Error messages (✗, error, failed)
 * - Info messages (ℹ, information, found)
 * - Operation summaries
 *
 * @param response - Response text to display
 * @param isLoading - Loading state
 */
export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  isLoading = false
}) => {
  const [copied, setCopied] = React.useState(false);

  // Parse response and determine type
  const parsed = useMemo(() => {
    const upperResponse = response.toUpperCase();

    // Determine response type
    let type: 'success' | 'error' | 'info' = 'info';
    let icon: React.ReactNode;
    let color: string;

    if (upperResponse.includes('✓') || 
        upperResponse.includes('SUCCESS') || 
        upperResponse.includes('COMPLETE') ||
        upperResponse.includes('VERIFIED') ||
        upperResponse.includes('PROCESSED')) {
      type = 'success';
      icon = <CheckCircle2 className="w-5 h-5 flex-shrink-0" />;
      color = 'text-green-400';
    } else if (upperResponse.includes('✗') ||
               upperResponse.includes('ERROR') ||
               upperResponse.includes('FAILED') ||
               upperResponse.includes('TIMEOUT')) {
      type = 'error';
      icon = <AlertCircle className="w-5 h-5 flex-shrink-0" />;
      color = 'text-red-400';
    } else {
      icon = <Info className="w-5 h-5 flex-shrink-0" />;
      color = 'text-blue-400';
    }

    // Extract key information
    const numberMatches = response.match(/\b(\d+)\s+(operation|file|dlc|pack|error)\w*/gi) || [];
    const sizeMatches = response.match(/(\d+\.?\d*)\s*(MB|GB|KB|B)(?!\w)/gi) || [];

    return {
      type,
      icon,
      color,
      title: extractTitle(response),
      description: extractDescription(response),
      details: extractDetails(response, numberMatches, sizeMatches)
    };
  }, [response]);

  const handleCopy = () => {
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!response) {
    return (
      <motion.div
        className="glass-medium rounded-lg p-6 border border-white/20 text-center text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm">No response yet. Run a command to see results here.</p>
      </motion.div>
    );
  }

  const bgColor = parsed.type === 'success' 
    ? 'from-green-500/10 to-green-600/5 border-green-500/30'
    : parsed.type === 'error'
    ? 'from-red-500/10 to-red-600/5 border-red-500/30'
    : 'from-blue-500/10 to-blue-600/5 border-blue-500/30';

  return (
    <motion.div
      className={`glass-medium rounded-lg border p-6 bg-gradient-to-br ${bgColor} overflow-hidden`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={response}
      transition={{ duration: 0.3 }}
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3 mb-4">
        <motion.div
          className={parsed.color}
          animate={isLoading ? { rotate: 360 } : {}}
          transition={isLoading ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
        >
          {parsed.icon}
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.h3
            className={`text-lg font-semibold ${parsed.color} mb-1`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {parsed.title}
          </motion.h3>
          <motion.p
            className="text-white/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {parsed.description}
          </motion.p>
        </div>
      </div>

      {/* Details section */}
      {parsed.details.length > 0 && (
        <motion.div
          className="mb-4 space-y-2 p-3 bg-white/5 rounded border border-white/10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3 }}
        >
          {parsed.details.map((detail, idx) => (
            <motion.div
              key={idx}
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
            >
              <span className="text-white/70">{detail.label}</span>
              <span className={`font-semibold ${detail.color}`}>
                {detail.value}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Full response text (collapsed by default) */}
      <details className="group">
        <summary className="cursor-pointer text-white/60 text-xs font-medium hover:text-white/80 transition-colors flex items-center gap-2">
          <span className="group-open:hidden">▶</span>
          <span className="hidden group-open:inline">▼</span>
          Full Response
        </summary>
        <motion.pre
          className="mt-3 p-3 bg-black/30 rounded border border-white/10 text-white/70 text-xs font-mono overflow-auto max-h-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {response}
        </motion.pre>
      </details>

      {/* Copy button */}
      <motion.button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white/80"
        title="Copy response"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Copy className="w-4 h-4" />
      </motion.button>

      {/* Copy confirmation */}
      {copied && (
        <motion.div
          className="absolute top-12 right-4 bg-green-500/20 border border-green-500/50 rounded px-2 py-1 text-xs text-green-300"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          Copied!
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Extract title from response text
 */
function extractTitle(response: string): string {
  // Look for common title patterns
  const titleMatch = response.match(/^([✓✗]?\s*[^.\n]*)/);
  if (titleMatch) {
    return titleMatch[1].trim().replace(/^[✓✗]\s*/, '').substring(0, 60);
  }
  return 'Response';
}

/**
 * Extract description from response text
 */
function extractDescription(response: string): string {
  // Get first line after title
  const lines = response.split('\n');
  const desc = lines.slice(1).find(l => l.trim().length > 0);
  if (desc) {
    return desc.trim().substring(0, 100);
  }
  return response.substring(0, 100);
}

/**
 * Extract structured details from response
 */
function extractDetails(
  response: string,
  numberMatches: string[],
  sizeMatches: string[]
): Array<{ label: string; value: string; color: string }> {
  const details: Array<{ label: string; value: string; color: string }> = [];

  // Add operation counts
  if (numberMatches.length > 0) {
    numberMatches.forEach(match => {
      const [count, type] = match.split(/\s+/);
      if (count && type) {
        details.push({
          label: `${type.charAt(0).toUpperCase()}${type.slice(1)}s`,
          value: count,
          color: 'text-blue-400'
        });
      }
    });
  }

  // Add size information
  if (sizeMatches.length > 0) {
    details.push({
      label: 'Total Size',
      value: sizeMatches[0],
      color: 'text-green-400'
    });
  }

  // Extract percentage if present
  const percentMatch = response.match(/(\d+)%/);
  if (percentMatch) {
    details.push({
      label: 'Progress',
      value: percentMatch[1] + '%',
      color: 'text-yellow-400'
    });
  }

  return details;
}

export default ResponseDisplay;
