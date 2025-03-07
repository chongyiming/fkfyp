import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  ChevronDown,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TransactionStatus = "pending" | "approved" | "rejected";
type SortField = "date" | "price" | "status";
type SortOrder = "asc" | "desc";

interface Transaction {
  id: string;
  propertyAddress: string;
  listingPrice: number;
  buyerName: string;
  status: TransactionStatus;
  createdAt: string;
  documents: string[];
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    propertyAddress: "123 Main Street, City, State",
    listingPrice: 450000,
    buyerName: "John Doe",
    status: "pending",
    createdAt: "2024-02-15",
    documents: ["booking-form.pdf", "id-verification.pdf"],
  },
  {
    id: "2",
    propertyAddress: "456 Oak Avenue, City, State",
    listingPrice: 680000,
    buyerName: "Jane Smith",
    status: "approved",
    createdAt: "2024-02-14",
    documents: [
      "booking-form.pdf",
      "loan-application.pdf",
      "id-verification.pdf",
    ],
  },
  {
    id: "3",
    propertyAddress: "789 Pine Street, City, State",
    listingPrice: 525000,
    buyerName: "Robert Johnson",
    status: "rejected",
    createdAt: "2024-02-13",
    documents: ["booking-form.pdf"],
  },
];

const TransactionList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  );
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const statusIcons = {
    pending: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    approved: <CheckCircle className="h-5 w-5 text-green-500" />,
    rejected: <XCircle className="h-5 w-5 text-red-500" />,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredAndSortedTransactions = mockTransactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.propertyAddress
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortField === "price") {
        return sortOrder === "asc"
          ? a.listingPrice - b.listingPrice
          : b.listingPrice - a.listingPrice;
      }
      if (sortField === "status") {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Transaction List</h2>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search transactions..."
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort By
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("date");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("price");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Price{" "}
                {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("status");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                Status{" "}
                {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedTransactions.map((transaction) => (
          <Card key={transaction.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{transaction.propertyAddress}</h3>
                  {statusIcons[transaction.status]}
                </div>
                <p className="text-sm text-muted-foreground">
                  Buyer: {transaction.buyerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: {formatCurrency(transaction.listingPrice)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-muted-foreground">
                  Created: {transaction.createdAt}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSelectedDocuments(transaction.documents);
                    setIsDocumentModalOpen(true);
                  }}
                >
                  <span className="text-sm text-muted-foreground">
                    {transaction.documents.length} documents
                  </span>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{doc}</span>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionList;
