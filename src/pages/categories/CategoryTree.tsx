import { useSelector } from "react-redux";

const CategoryTree = ({ data }: { data: any }) => {
  const language = useSelector((state: any) => state.language.lang);

  const renderTree = (nodes: any, level = 0) => {
    return (
      <ul className="space-y-1">
        {nodes.map((node: any) => (
          <li key={node._id} className="pl-4 border-l border-gray-300 relative">
            <div className="flex  items-center space-x-2 group hover:bg-gray-100 p-1 rounded-md transition-all">
              {/* <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-700" /> */}

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

  const render = () => {
    if (language === "ar") {
      return "لا يوجد فئات";
    } else {
      return "No categories found.";
    }
  };

  return (
    <div className="bg-white mb-4 p-4 rounded-lg  border text-sm max-h-[400px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
        {language === "ar" ? "شجرة الفئات" : "Category Tree"}{" "}
      </h3>
      {data?.length > 0 ? renderTree(data) : <p className="text-gray-500">{render()}</p>}
    </div>
  );
};

export default CategoryTree;
