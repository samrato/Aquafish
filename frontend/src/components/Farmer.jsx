import React, { useEffect, useState } from "react";
import DataTable, { defaultThemes } from "react-data-table-component";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

function Farmer() {
  const [cagesData, setCagesData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [cageName, setCageName] = useState("");

  // Add cage
  const handleAddCage = async (e) => {
    e.preventDefault();
    let userUid = JSON.parse(localStorage.getItem("user"));
    let sendData = {
      name: cageName,
      ownerId: userUid.uid,
      location: {
        longitude: null,
        latitude: null,
      },
      oxygen: null,
      nitrogen: null,
      phosphorus: null,
      temp: null,
    };

    toast.loading("Adding cage");
    try {
      const cage = await addDoc(collection(db, "cages"), sendData);
      toast.dismiss();
      if (cage) {
        toast.success("Cage added successfully! 🐠");
      }
      setCageName("");
      handleShowTable();
    } catch (err) {
      console.error("Add cage error:", err);
      toast.error("An error occurred. Try again");
    }
  };

  // Show/hide form
  const handleShowForm = () => {
    setShowTable(false);
    setShowForm(true);
  };

  // Show/hide table
  const handleShowTable = () => {
    setShowForm(false);
    setShowTable(true);
  };

  // Get realtime cages data
  useEffect(() => {
    let userUid = JSON.parse(localStorage.getItem("user"));
    const q = query(
      collection(db, "cages"),
      where("ownerId", "==", userUid.uid)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCagesData(cagesData);
    });
    return () => unsubscribe();
  }, []);

  // Set data to be shown in table
  useEffect(() => {
    const data = cagesData.map((cage) => {
      return {
        name: cage.name,
        location: `${cage.location.latitude ?? "N/A"},${
          cage.location.longitude ?? "N/A"
        }`,
        oxygen: cage.oxygen ?? "N/A",
        nitrogen: cage.nitrogen ?? "N/A",
        phosphorus: cage.phosphorus ?? "N/A",
        temperature: cage.temp ?? "N/A",
        id: cage.id,
      };
    });
    setTableData(data);
  }, [cagesData]);

  // Define columns for the table
  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Oxygen",
      selector: (row) => row.oxygen,
      sortable: true,
      right: true,
    },
    {
      name: "Temperature",
      selector: (row) => row.temperature,
      sortable: true,
      right: true,
    },
    {
      name: "Location",
      selector: (row) => row.location,
      sortable: true,
      right: true,
      hide: "md",
    },
    {
      name: "Nitrogen",
      selector: (row) => row.nitrogen,
      sortable: true,
      right: true,
      hide: "md",
    },
    {
      name: "Phosphorus",
      selector: (row) => row.phosphorus,
      sortable: true,
      right: true,
      hide: "md",
    },
  ];

  // Define data to be shown when a row is expanded
  const ExpandedComponent = ({ data }) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm">
      <p>
        <strong>Location:</strong> {data.location}
      </p>
      <p>
        <strong>Oxygen:</strong> {data.oxygen}
      </p>
      <p>
        <strong>Nitrogen:</strong> {data.nitrogen}
      </p>
      <p>
        <strong>Phosphorus:</strong> {data.phosphorus}
      </p>
      <p>
        <strong>Temperature:</strong> {data.temperature}
      </p>
    </div>
  );

  // Delete selected rows
  const handleRowsSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const contextActions = React.useMemo(() => {
    const handleDeleteSelected = async () => {
      if (selectedRows.length === 0) {
        toast.error("No cages selected.");
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete the selected cages?"
      );
      if (!confirmDelete) return;

      toast.loading("Deleting selected cages...");
      try {
        for (const row of selectedRows) {
          await deleteDoc(doc(db, "cages", row.id));
        }
        toast.dismiss();
        toast.success("Selected cages deleted successfully!");
        setSelectedRows([]);
        setToggleCleared(!toggleCleared);
      } catch (err) {
        console.error("Delete cages error:", err);
        toast.dismiss();
        toast.error(
          "An error occurred while deleting cages. Please try again."
        );
      }
    };

    return (
      <button
        className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
        onClick={handleDeleteSelected}
        style={{ cursor: "pointer" }}
      >
        Delete selected
      </button>
    );
  }, [selectedRows, toggleCleared]);

  // Framer motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
      },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="container mx-auto px-4 mt-12 font-sans">
      <h1 className="text-4xl font-bold text-blue-800 mb-6 text-center">
        My Aqua Cages 🌊
      </h1>
      <div className="flex justify-end gap-4 mb-6">
        <button
          className={`px-6 py-3 rounded-md font-semibold text-sm transition-all duration-300 ease-in-out
                        ${
                          !showForm
                            ? "bg-blue-600 text-white shadow-lg transform scale-105"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
          onClick={handleShowTable}
        >
          View Cages
        </button>
        <button
          className={`px-6 py-3 rounded-md font-semibold text-sm transition-all duration-300 ease-in-out
                        ${
                          showForm
                            ? "bg-blue-600 text-white shadow-lg transform scale-105"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
          onClick={handleShowForm}
        >
          Add Cage
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showTable && (
          <motion.div
            key="table"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100"
          >
            <DataTable
              title="Cages Overview"
              columns={columns}
              data={tableData}
              customStyles={{
                ...defaultThemes.default,
                headCells: {
                  style: {
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#1e3a8a", // Dark blue text
                    backgroundColor: "#eef2ff", // Light blue header
                    borderBottom: "1px solid #d1d5db",
                  },
                },
                cells: {
                  style: {
                    fontSize: "13px",
                    color: "#4b5563",
                  },
                },
                rows: {
                  highlightOnHoverStyle: {
                    backgroundColor: "rgb(239, 246, 255)", // Light blue hover
                    borderBottomColor: "#FFFFFF",
                    borderRadius: "25px",
                    outline: "1px solid #bfdbfe",
                  },
                },
              }}
              pagination
              highlightOnHover
              pointerOnHover
              expandableRows
              expandableRowsComponent={ExpandedComponent}
              selectableRows
              onSelectedRowsChange={handleRowsSelected}
              contextActions={contextActions}
              clearSelectedRows={toggleCleared}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.form
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleAddCage}
            className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
              Add a New Cage
            </h2>
            <label
              htmlFor="cageName"
              className="block text-gray-700 font-medium mb-2"
            >
              Enter Cage Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="cageName"
                placeholder="e.g., Cage Alpha"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={cageName}
                onChange={(e) => setCageName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
              >
                Submit
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default Farmer;
