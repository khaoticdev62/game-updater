import React, { useState, useMemo } from 'react';
import { DLC } from '../types';
import { VisionCard } from './VisionCard';
import { motion } from 'framer-motion';

interface DLCGridProps {
  dlcs: DLC[];
  onToggle: (folder: string) => void;
}

const DLCGrid: React.FC<DLCGridProps> = ({ dlcs, onToggle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(dlcs.map(d => d.category || 'Other'));
    return ['All', ...Array.from(cats).sort()];
  }, [dlcs]);

  // Filter DLCs based on category and search
  const filteredDLCs = useMemo(() => {
    return dlcs.filter(dlc => {
      const categoryMatch = selectedCategory === 'All' || dlc.category === selectedCategory;
      const searchMatch = searchQuery === '' ||
        dlc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dlc.folder.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [dlcs, selectedCategory, searchQuery]);

  // Group filtered DLCs by category for display
  const groupedDLCs = useMemo(() => {
    const groups: { [key: string]: DLC[] } = {};
    filteredDLCs.forEach(dlc => {
      const cat = dlc.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(dlc);
    });
    return groups;
  }, [filteredDLCs]);

  // Status color mapping
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Installed':
        return 'text-green-400';
      case 'Missing':
        return 'text-red-400';
      case 'Update Available':
        return 'text-yellow-400';
      default:
        return 'text-white/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search DLC by name or folder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'glass-medium border border-white/40 text-white'
                  : 'glass-light border border-white/20 text-white/70 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* DLC Grid */}
      <div className="space-y-8">
        {Object.entries(groupedDLCs).map(([catName, items]) => (
          <div key={catName}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {catName}
              <span className="text-sm text-white/50">({items.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(dlc => (
                <motion.div
                  key={dlc.folder}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <VisionCard
                    variant="elevated"
                    className={`cursor-pointer h-full border-2 transition-all ${
                      dlc.selected
                        ? 'border-blue-500/50 bg-white/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <button
                      onClick={() => onToggle(dlc.folder)}
                      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                      title={dlc.description}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm mb-1">
                            {dlc.name}
                          </h4>
                          <p className="text-xs text-white/50">
                            {dlc.folder}
                            {dlc.release_date && ` • ${dlc.release_date}`}
                          </p>
                        </div>

                        {/* Selection Indicator */}
                        {dlc.selected && (
                          <div className="ml-2 text-lg text-blue-400">✓</div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className={`text-xs font-semibold ${getStatusColor(dlc.status)}`}>
                        {dlc.status}
                      </div>
                    </button>
                  </VisionCard>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredDLCs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">No DLC found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="glass-medium rounded-lg p-4 border border-white/20 text-sm">
        <p className="text-white">
          Showing {filteredDLCs.length} of {dlcs.length} DLC
          {selectedCategory !== 'All' && ` • Category: ${selectedCategory}`}
          {searchQuery && ` • Search: "${searchQuery}"`}
        </p>
      </div>
    </div>
  );
};

export default DLCGrid;
