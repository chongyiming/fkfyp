import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "../app/supabaseClient";
import { useUserPermissions } from "./UserPermissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { parse } from "path";

interface TransactionFormProps {
  onClose: () => void;
  marketType: "primary" | "secondary";
}

const TransactionForm = ({ onClose, marketType }: TransactionFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "loan">("cash");
  const [transactionType, setTransactionType] = useState<
    "sale" | "purchase" | "rental"
  >("sale");
  const [buyerType, setBuyerType] = useState<"individual" | "company">(
    "individual"
  );
  const [formData, setFormData] = useState({
    agent_id: "",
    transactionPrice: "",
    nettPrice: "",
    commissionAmount: "",
    cobroke_commission_amount: "",
    commissionSplit: "",
    co_agent_details: "",
    special_remarks: "",
    follow_up_tasks: "",
    special_conditions_of_sale: "",
    incentives_rebates: "",
    document_urls: "",
    folder_name: "",
    bank_name: "",
    loan_amount: "",
    loan_status: "",
  });
  const [formErrors, setFormErrors] = useState({
    nettPrice: "",
    commissionSplit: "",
  });
  const [properties, setProperties] = useState<
    { id: string; address: string; commission_rate: number }[]
  >([]);
  const [agents, setAgents] = useState<{ id: string; username: string }[]>([]);
  const [buyers, setBuyers] = useState<{ id: string; full_name: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState("");
  const [commission, setCommission] = useState(0);
  const [selectedPropertyCommission, setSelectedPropertyCommission] =
    useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isAgentDropdownVisible, setIsAgentDropdownVisible] = useState(false);
  const { userId, perms, id } = useUserPermissions();
  const [buyerSearchQuery, setBuyerSearchQuery] = useState("");
  const [isBuyerDropdownVisible, setIsBuyerDropdownVisible] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("");
  const [isAddBuyerDialogOpen, setIsAddBuyerDialogOpen] = useState(false);
  const [showCoBrokeSection, setShowCoBrokeSection] = useState(false);
  const [newBuyer, setNewBuyer] = useState<{
    full_name: string;
    email: string;
    phone: string;
    referred_by: number;
  }>({
    full_name: "",
    email: "",
    phone: "",
    referred_by: 0,
  });
  console.log("userId", userId);
  console.log("commission", commission);

  useEffect(() => {
    if (!showCoBrokeSection) {
      setSelectedAgentId("");
      setFormData((prev) => ({
        ...prev,
        commissionSplit: "0", // Reset commission split
        cobroke_commission_amount: "0", // Reset co-broke commission amount
      }));
    }
  }, [showCoBrokeSection]);

  useEffect(() => {
    if (id) {
      setNewBuyer((prev) => ({
        ...prev,
        referred_by: parseInt(id),
      }));
      setFormData((prev) => ({
        ...prev,
        agent_id: id,
      }));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchAgentLevel = async () => {
        const { data, error } = await supabase
          .from("Agents")
          .select("current_level_id")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching level:", error);
        } else {
          setCurrentLevel(data.current_level_id);
          const { data: levelData, error: levelError } = await supabase
            .from("AgentLevel")
            .select("commission_rate")
            .eq("id", data.current_level_id)
            .single();

          if (levelError) {
            console.error("Error fetching commission rate:", levelError);
          } else {
            setCommission(levelData.commission_rate);
          }
        }
      };
      fetchAgentLevel();
    }
  }, [id, userId]);

  useEffect(() => {
    const fetchCommission = async () => {
      const { data, error } = await supabase
        .from("AgentLevel")
        .select("commission_rate")
        .eq("id", currentLevel);

      if (error) {
        console.error("Error fetching level:", error);
      } else {
        setCommission(data[0]?.commission_rate);
      }
    };
    fetchCommission();
  }, [currentLevel]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("Properties")
        .select("id, address, commission_rate");
      if (error) {
        console.error("Error fetching properties:", error);
      } else {
        setProperties(data);
      }
    };

    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("Agents")
        .select("id, username");
      if (error) {
        console.error("Error fetching agents:", error);
      } else {
        setAgents(data);
      }
    };

    const fetchBuyers = async () => {
      const { data, error } = await supabase
        .from("Buyer")
        .select("id, full_name");
      if (error) {
        console.error("Error fetching buyers:", error);
      } else {
        setBuyers(data);
      }
    };

    fetchProperties();
    fetchAgents();
    fetchBuyers();
  }, []);

  const filteredProperties = properties.filter((property) =>
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgents = agents.filter((agent) =>
    agent.username.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  const filteredBuyers = buyers.filter((buyer) =>
    buyer.full_name.toLowerCase().includes(buyerSearchQuery.toLowerCase())
  );

  const generateRandomFolderName = () => {
    return `transaction_${Math.random().toString(36).substring(2, 15)}`;
  };

  const uploadFilesToSupabase = async (files: File[], folderName: string) => {
    const uploadedFileUrls: string[] = [];

    for (const file of files) {
      const filePath = `documents/${folderName}/${file.name}`;
      const { data, error } = await supabase.storage
        .from("test")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      if (data) {
        const { data: urlData } = supabase.storage
          .from("test")
          .getPublicUrl(filePath);
        uploadedFileUrls.push(urlData.publicUrl);
      }
    }

    return uploadedFileUrls;
  };

  const validateForm = () => {
    const errors = {
      nettPrice: "",
      commissionSplit: "",
    };

    // Validate Nett Price
    const transactionPrice = parseFloat(formData.transactionPrice);
    const nettPrice = parseFloat(formData.nettPrice);

    if (nettPrice > transactionPrice) {
      errors.nettPrice = "Nett price must be less than transaction price";
    }

    // Validate Commission Split
    const commissionSplit = parseFloat(formData.commissionSplit);
    if (commissionSplit < 0 || commissionSplit > 100) {
      errors.commissionSplit = "Commission split must be between 0 and 100";
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear specific error when user starts typing
    if (id === "nettPrice" || id === "commissionSplit") {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleNewBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewBuyer((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data, error } = await supabase
      .from("Buyer")
      .insert([newBuyer])
      .select();
    if (error) {
      console.error("Error adding buyer:", error);
    } else {
      setBuyers((prev) => [...prev, data[0]]);
      setIsAddBuyerDialogOpen(false);
      setNewBuyer({
        full_name: "",
        email: "",
        phone: "",
        referred_by: parseInt(id),
      });
    }
  };
  useEffect(() => {
    const transactionPrice = parseFloat(formData.transactionPrice) || 0;
    const propertiesCommission = selectedPropertyCommission / 100;
    const agentCommission = commission;

    if (
      transactionPrice > 0 &&
      propertiesCommission > 0 &&
      agentCommission > 0
    ) {
      // Calculate full commission amount based on property commission and agent's commission rate
      const fullCommissionAmount =
        transactionPrice * propertiesCommission * agentCommission;

      if (showCoBrokeSection && selectedAgentId) {
        // If co-broke section is visible and a co-broke agent is selected, calculate the split
        const commissionSplit = parseFloat(formData.commissionSplit) || 100;
        const primaryAgentShare =
          fullCommissionAmount * ((100 - commissionSplit) / 100);
        const cobrokeAgentShare =
          fullCommissionAmount * (commissionSplit / 100);

        setFormData((prev) => ({
          ...prev,
          commissionAmount: primaryAgentShare.toFixed(2),
          cobroke_commission_amount: cobrokeAgentShare.toFixed(2),
        }));
      } else {
        // If co-broke section is hidden or no co-broke agent is selected, the primary agent gets the full commission
        setFormData((prev) => ({
          ...prev,
          commissionAmount: fullCommissionAmount.toFixed(2),
          cobroke_commission_amount: "0", // Reset co-broke commission amount
        }));
      }
    }
  }, [
    formData.transactionPrice,
    selectedPropertyCommission,
    commission,
    selectedAgentId,
    formData.commissionSplit,
    showCoBrokeSection, // Add showCoBrokeSection to the dependency array
  ]);

  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = properties.find(
      (property) => property.id === propertyId
    );
    if (selectedProperty) {
      setSelectedPropertyId(propertyId);
      setSelectedPropertyCommission(selectedProperty.commission_rate);
      setSelectedAgentId(""); // Reset co-broke agent selection
      setFormData((prev) => ({
        ...prev,
        commissionSplit: "50", // Reset commission split to default
        cobroke_commission_amount: "0", // Reset co-broke commission amount
      }));
    }
  };

  const filteredCoBrokeAgents = agents.filter((agent) => agent.id !== id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      // Generate a random folder name
      const folderName = generateRandomFolderName();

      // Upload files to Supabase storage
      const uploadedFileUrls = await uploadFilesToSupabase(files, folderName);

      // Prepare transaction data
      const transactionData = {
        agent_id: parseInt(formData.agent_id),
        property_id: parseInt(selectedPropertyId),
        buyer_id: parseInt(selectedBuyerId),
        transaction_price: parseFloat(formData.transactionPrice),
        nett_price: parseFloat(formData.nettPrice),
        commission_amount: parseFloat(formData.commissionAmount),
        cobroke_id: parseInt(selectedAgentId),
        cobroke_commission_split: parseFloat(formData.commissionSplit),
        cobroke_commission_amount: parseFloat(
          formData.cobroke_commission_amount
        ),
        co_agent_details: formData.co_agent_details,
        special_remarks: formData.special_remarks,
        follow_up_tasks: formData.follow_up_tasks,
        special_conditions_of_sale: formData.special_conditions_of_sale,
        incentives_rebates: parseFloat(formData.incentives_rebates),
        payment_method: paymentMethod,
        transaction_type: transactionType,
        document_urls: uploadedFileUrls, // Store the URLs of the uploaded files
        folder_name: folderName, // Store the folder name for the uploaded files
        bank_name: formData.bank_name,
        loan_amount: parseFloat(formData.loan_amount),
        loan_status: formData.loan_status,
      };

      // Insert transaction data into the database
      const { data, error } = await supabase
        .from("Transactions")
        .insert([transactionData]);

      if (error) {
        console.error("Error inserting transaction:", error);
        alert("Failed to create transaction. Please try again.");
      } else {
        console.log("Transaction created successfully:", data);
        alert("Transaction created successfully!");
        onClose();
        addAgentCommission();
        window.location.reload();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  const addAgentCommission = async () => {
    try {
      // Fetch the primary agent's current commission and sales volume
      const { data: primaryAgent, error: primaryAgentFetchError } =
        await supabase
          .from("Agents")
          .select(
            "pending_commission, total_sales_volume, number_of_transactions"
          )
          .eq("id", formData.agent_id)
          .single();

      if (primaryAgentFetchError) {
        console.error(
          "Error fetching primary agent's data:",
          primaryAgentFetchError
        );
        throw primaryAgentFetchError;
      }

      // Calculate new values for the primary agent
      const newPendingCommission =
        (primaryAgent.pending_commission || 0) +
        parseFloat(formData.commissionAmount);
      const newTotalSalesVolume =
        (primaryAgent.total_sales_volume || 0) +
        parseFloat(formData.transactionPrice);
      const newNumberOfTransactions =
        (primaryAgent.number_of_transactions || 0) + 1;
      // Update the primary agent's commission and sales volume
      const { data: primaryAgentData, error: primaryAgentUpdateError } =
        await supabase
          .from("Agents")
          .update({
            pending_commission: newPendingCommission,
            total_sales_volume: newTotalSalesVolume,
            number_of_transactions: newNumberOfTransactions,
          })
          .eq("id", formData.agent_id);

      if (primaryAgentUpdateError) {
        console.error(
          "Error updating primary agent's commission:",
          primaryAgentUpdateError
        );
        throw primaryAgentUpdateError;
      }

      console.log(
        "Primary agent's commission updated successfully:",
        primaryAgentData
      );

      // If there is a co-broke agent, update their commission and sales volume as well
      if (selectedAgentId && formData.cobroke_commission_amount) {
        // Fetch the co-broke agent's current commission and sales volume
        const { data: coBrokeAgent, error: coBrokeAgentFetchError } =
          await supabase
            .from("Agents")
            .select(
              "pending_commission, total_sales_volume,number_of_transactions"
            )
            .eq("id", selectedAgentId)
            .single();

        if (coBrokeAgentFetchError) {
          console.error(
            "Error fetching co-broke agent's data:",
            coBrokeAgentFetchError
          );
          throw coBrokeAgentFetchError;
        }

        // Calculate new values for the co-broke agent
        const newCoBrokePendingCommission =
          (coBrokeAgent.pending_commission || 0) +
          parseFloat(formData.cobroke_commission_amount);
        const newCoBrokeTotalSalesVolume =
          (coBrokeAgent.total_sales_volume || 0) +
          parseFloat(formData.transactionPrice);
        const newCoBrokeNumberOfTransactions =
          (coBrokeAgent.number_of_transactions || 0) + 1;
        // Update the co-broke agent's commission and sales volume
        const { data: coBrokeAgentData, error: coBrokeAgentUpdateError } =
          await supabase
            .from("Agents")
            .update({
              pending_commission: newCoBrokePendingCommission,
              total_sales_volume: newCoBrokeTotalSalesVolume,
              number_of_transactions: newCoBrokeNumberOfTransactions,
            })
            .eq("id", selectedAgentId);

        if (coBrokeAgentUpdateError) {
          console.error(
            "Error updating co-broke agent's commission:",
            coBrokeAgentUpdateError
          );
          throw coBrokeAgentUpdateError;
        }

        console.log(
          "Co-broke agent's commission updated successfully:",
          coBrokeAgentData
        );
      }
    } catch (error) {
      console.error("Unexpected error in addAgentCommission:", error);
      throw error;
    }
  };
  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            New{" "}
            {marketType === "primary"
              ? "Developer Project"
              : "Individual Property"}{" "}
            Transaction
          </h2>
          {/* Basic Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketType === "primary" ? (
                <>
                  {/* Primary Market Fields */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="projectSearch">Search Project</Label>
                    <div className="relative">
                      <Input
                        id="projectSearch"
                        placeholder="Type to search developer projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsDropdownVisible(true)}
                        onBlur={() =>
                          setTimeout(() => setIsDropdownVisible(false), 100)
                        }
                        required
                      />
                      {isDropdownVisible && (
                        <div className="absolute z-10 mt-2 w-full bg-background border border-muted rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProperties.map((property) => (
                            <div
                              key={property.id}
                              className="p-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                handlePropertySelect(property.id);
                                setSearchQuery(property.address);
                                setIsDropdownVisible(false);
                              }}
                            >
                              {property.address}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Search for developer projects by name, location, or
                      developer
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Secondary Market Fields */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Textarea
                      id="propertyAddress"
                      placeholder="Enter complete property address"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={(value: "sale" | "purchase" | "rental") =>
                  setTransactionType(value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sale" id="sale" />
                  <Label htmlFor="sale">Sale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purchase" id="purchase" />
                  <Label htmlFor="purchase">Purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rental" id="rental" />
                  <Label htmlFor="rental">Rental</Label>
                </div>
              </RadioGroup>
            </div> */}
              <div className="space-y-2">
                <Label htmlFor="transactionPrice">Transaction Price</Label>
                <Input
                  id="transactionPrice"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.transactionPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionPrice: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nettPrice">Nett Price</Label>
                <Input
                  id="nettPrice"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.nettPrice}
                  onChange={handleInputChange}
                  required // Make this field mandatory
                />
                {formErrors.nettPrice && (
                  <p className="text-sm text-red-500">{formErrors.nettPrice}</p>
                )}
              </div>
              {/* <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.1"
                placeholder="Enter percentage"
                value={formData.commissionRate}
                onChange={handleInputChange}
                required // Make this field mandatory
              />
              {errors.commissionRate && (
                <p className="text-sm text-red-500">{errors.commissionRate}</p>
              )}
            </div> */}
              <div className="space-y-4">
                {/* Commission Amount Field */}
                <div className="space-y-2">
                  <Label htmlFor="commissionAmount">Commission Amount</Label>
                  <Input
                    id="commissionAmount"
                    type="number"
                    placeholder="Calculated automatically"
                    value={formData.commissionAmount}
                    readOnly
                  />
                </div>
              </div>
              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: "cash" | "loan") =>
                    setPaymentMethod(value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="loan" id="loan" />
                    <Label htmlFor="loan">Loan</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Loan Details (Conditional) */}
            {paymentMethod === "loan" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name" // Correct ID
                    placeholder="Enter bank name"
                    value={formData.bank_name} // Bind to the correct field
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_amount">Loan Amount</Label>
                  <Input
                    id="loan_amount" // Correct ID
                    type="number"
                    placeholder="Enter loan amount"
                    value={formData.loan_amount} // Bind to the correct field
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_status">Loan Status</Label>
                  <Select
                    value={formData.loan_status} // Bind to the correct field
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, loan_status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          {/* Buyer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Buyer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerSearch">Select Buyer</Label>
                <div className="relative">
                  <Input
                    id="buyerSearch"
                    placeholder="Type to search buyers..."
                    className="w-full"
                    value={buyerSearchQuery}
                    onChange={(e) => setBuyerSearchQuery(e.target.value)}
                    onFocus={() => setIsBuyerDropdownVisible(true)}
                    onBlur={() =>
                      setTimeout(() => setIsBuyerDropdownVisible(false), 100)
                    }
                    required
                  />
                  {isBuyerDropdownVisible && (
                    <div className="absolute z-10 mt-2 w-full bg-background border border-muted rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredBuyers.length > 0 ? (
                        filteredBuyers.map((buyer) => (
                          <div
                            key={buyer.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedBuyerId(buyer.id);
                              setBuyerSearchQuery(buyer.full_name);
                              setIsBuyerDropdownVisible(false);
                            }}
                          >
                            {buyer.full_name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No Buyers Found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-end">
                <Dialog
                  open={isAddBuyerDialogOpen}
                  onOpenChange={setIsAddBuyerDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-32">
                      Add New Buyer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Buyer</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault(); // Prevent default form submission
                        e.stopPropagation(); // Stop event bubbling
                        handleNewBuyerSubmit(e);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          placeholder="Enter full name"
                          value={newBuyer.full_name}
                          onChange={handleNewBuyerChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email"
                          value={newBuyer.email}
                          onChange={handleNewBuyerChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          value={newBuyer.phone}
                          onChange={handleNewBuyerChange}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddBuyerDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Buyer</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          {/* Co-Broke Section */}

          <div className="space-y-4">
            {/* Add the checkbox to toggle co-broke section visibility */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCoBrokeSection"
                checked={showCoBrokeSection}
                onChange={(e) => {
                  setShowCoBrokeSection(e.target.checked);
                  if (!e.target.checked) {
                    // Reset co-broke fields when the checkbox is unchecked
                    setSelectedAgentId("");
                    setFormData((prev) => ({
                      ...prev,
                      commissionSplit: "0", // Reset commission split
                      cobroke_commission_amount: "0", // Reset co-broke commission amount
                    }));
                  }
                }}
              />
              <Label htmlFor="showCoBrokeSection">
                Show Co-Broke Information
              </Label>
            </div>

            {/* Conditionally render the co-broke section and title based on the checkbox state */}
            {showCoBrokeSection && (
              <>
                {/* Co-Broke Details Title */}
                <h3 className="text-lg font-medium">Co-Broke Details</h3>

                {/* Co-Broke Section Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Co-Broke Agent */}
                  <div className="space-y-2">
                    <Label htmlFor="cobrokeAgentSearch">
                      Select Co-Broke Agent
                    </Label>
                    <div className="relative">
                      <Input
                        id="cobrokeAgentSearch"
                        placeholder="Type to search co-broke agents..."
                        value={agentSearchQuery}
                        onChange={(e) => setAgentSearchQuery(e.target.value)}
                        onFocus={() => setIsAgentDropdownVisible(true)}
                        onBlur={() =>
                          setTimeout(
                            () => setIsAgentDropdownVisible(false),
                            100
                          )
                        }
                      />
                      {isAgentDropdownVisible && (
                        <div className="absolute z-10 mt-2 w-full bg-background border border-muted rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCoBrokeAgents.map((agent) => (
                            <div
                              key={agent.id}
                              className="p-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setSelectedAgentId(agent.id);
                                setAgentSearchQuery(agent.username);
                                setIsAgentDropdownVisible(false);
                              }}
                            >
                              {agent.username}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Commission Split (%) */}
                  <div className="space-y-2">
                    <Label htmlFor="commissionSplit">
                      Commission Split (%)
                    </Label>
                    <Input
                      id="commissionSplit"
                      type="number"
                      step="0.1"
                      placeholder="Enter commission split"
                      value={formData.commissionSplit}
                      onChange={handleInputChange}
                    />
                    {formErrors.commissionSplit && (
                      <p className="text-sm text-red-500">
                        {formErrors.commissionSplit}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      If set to 60, co-broke agent gets 60% of property
                      commission, while the original agent gets 40%
                    </p>
                  </div>

                  {/* Co-Broke Commission Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="cobrokeCommissionAmount">
                      Co-Broke Commission Amount
                    </Label>
                    <Input
                      id="cobroke_commission_amount"
                      type="number"
                      placeholder="Calculated automatically"
                      value={formData.cobroke_commission_amount}
                      readOnly
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documents</h3>
            <div className="border-2 border-dashed border-muted p-6 rounded-lg text-center">
              <Input
                type="file"
                id="documents"
                multiple
                className="hidden"
                onChange={handleFileChange}
                required
              />
              <label
                htmlFor="documents"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload required documents (Booking Form, ID Copy, etc.)
                </span>
              </label>
              {files.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {files.length} file(s) selected
                </div>
              )}
            </div>
          </div>
          {/* Show More Details Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdditionalFields(!showAdditionalFields)}
          >
            {showAdditionalFields
              ? "Hide Additional Details"
              : "Show Additional Details"}
          </Button>
          {/* Additional Details (Optional) */}
          {showAdditionalFields && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coAgentDetails">Co-Agent Details</Label>
                  <Textarea
                    id="co_agent_details"
                    placeholder="Enter co-agent details if any"
                    value={formData.co_agent_details}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRemarks">Special Remarks</Label>
                  <Textarea
                    id="special_remarks"
                    placeholder="Enter any special remarks"
                    value={formData.special_remarks}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpTasks">Follow-up Tasks</Label>
                  <Textarea
                    id="follow_up_tasks"
                    placeholder="Enter follow-up tasks"
                    value={formData.follow_up_tasks}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleConditions">
                    Special Conditions of Sale
                  </Label>
                  <Textarea
                    id="special_conditions_of_sale"
                    placeholder="Enter special conditions"
                    value={formData.special_conditions_of_sale}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incentives">Incentives/Rebates</Label>
                  {/* <Textarea
                    id="incentives_rebates"
                    placeholder="Enter incentives if any"
                    value={formData.incentives_rebates}
                    onChange={handleInputChange}
                  /> */}
                  <Input
                    id="incentives_rebates"
                    type="number"
                    placeholder="Enter incentives if any"
                    value={formData.incentives_rebates}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Transaction</Button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;
