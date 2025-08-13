import React from "react";
import { Folder, ChevronDown } from "lucide-react";

const CategoryTree = ({ data }) => {
  const renderTree = (nodes, level = 0) => {
    return (
      <ul className="space-y-1">
        {nodes.map((node) => (
          <li key={node._id} className="pl-4 border-l border-gray-300 relative">
            <div className="flex items-center space-x-2 group hover:bg-gray-100 p-1 rounded-md transition-all">
              {/* <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-700" /> */}
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="text-gray-800 font-medium">{node.name}</span>
            </div>
            {node.children && node.children.length > 0 && (
              <div className="ml-6">{renderTree(node.children, level + 1)}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white mb-4 p-4 rounded-lg  border text-sm max-h-[400px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-gray-800"> Category Tree</h3>
      {data?.length > 0 ? renderTree(data) : <p className="text-gray-500">No categories found.</p>}
    </div>
  );
};

export default CategoryTree;
