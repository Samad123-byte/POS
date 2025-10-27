import React, { useState, useEffect } from "react";

const Records = ({
  sales,
  products,
  salespersons,
  onEditSale,
  onDeleteSale,
  onNewSale,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "saleTime",
    direction: "desc",
  });
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [sales]);

  // Filter sales based on search term
  const filteredSales = sales.filter(
    (sale) =>
      sale.salespersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.total.toString().includes(searchTerm) ||
      (sale.comments &&
        sale.comments.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort sales
  const sortedSales = React.useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "total") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (
        sortConfig.key === "saleTime" ||
        sortConfig.key === "editDate"
      ) {
        const parseDate = (dateStr) => {
          if (!dateStr || dateStr === "--")
            return new Date("1900-01-01").getTime();
          const parts = dateStr.match(
            /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/
          );
          if (parts) {
            const [, day, month, year, hour, minute, second] = parts;
            return new Date(
              `${year}-${month}-${day}T${hour}:${minute}:${second}`
            ).getTime();
          }
          return new Date(dateStr).getTime();
        };
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase() || "";
        bValue = bValue?.toString().toLowerCase() || "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSales, sortConfig]);

  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sortedSales.slice(startIndex, endIndex);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey)
      return <span className="ml-1 text-gray-400">â†•</span>;
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-white">â†‘</span>
    ) : (
      <span className="ml-1 text-white">â†“</span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
        Sales Records
      </h2>

      <div className="mb-4 flex justify-between">
        <div className="flex text-sm items-center">
          <span>Show </span>
          <select className="mx-1 border border-gray-300 rounded px-2 py-1">
            <option>10</option>
          </select>
          <span> entries</span>
        </div>
        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <table className="w-full border-collapse border border-gray-300 mb-4 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <tr>
            <th
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort("saleTime")}
            >
              SALE TIME {getSortIcon("saleTime")}
            </th>
            <th
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort("total")}
            >
              TOTAL {getSortIcon("total")}
            </th>
            <th
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort("salespersonName")}
            >
              SALESPERSON NAME {getSortIcon("salespersonName")}
            </th>
            <th
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort("editDate")}
            >
              EDIT DATE {getSortIcon("editDate")}
            </th>
            <th
              className="border border-gray-300 px-4 py-3 font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
              onClick={() => handleSort("comments")}
            >
              COMMENTS {getSortIcon("comments")}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentSales.map((sale) => (
            <tr
              key={sale.id}
              className="border-b hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
              onDoubleClick={() => onEditSale(sale)} // âœ… double-click opens Sales page
            >
              <td className="border border-gray-300 px-4 py-3">
                {sale.saleTime}
              </td>
              <td className="border border-gray-300 px-4 py-3 font-semibold text-green-600">
                {sale.total.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {sale.salespersonName}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {sale.editDate || "âž–âž–"}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {sale.comments || "No comments"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedSales.length)}{" "}
          of {sortedSales.length} entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border border-gray-300 rounded-md ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onNewSale}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-md hover:from-green-600 hover:to-teal-600 transition-all duration-200 font-semibold"
        >
          New Sale
        </button>
      </div>
    </div>
  );
};

export default Records;
