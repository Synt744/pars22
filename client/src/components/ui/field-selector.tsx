import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useCreateDataField, 
  useUpdateDataField, 
  useDeleteDataField 
} from "@/hooks/use-scraper";
import { DataField } from "@shared/schema";
import {
  PlusIcon, 
  Pencil,
  Trash2,
  FileText,
  DollarSign,
  Star,
  MonitorSmartphone
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FieldSelectorProps {
  configId: number;
  fields: DataField[];
  isLoading: boolean;
}

export function FieldSelector({ configId, fields, isLoading }: FieldSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<DataField | null>(null);
  
  const [fieldName, setFieldName] = useState('');
  const [fieldSelector, setFieldSelector] = useState('');
  
  const createField = useCreateDataField();
  const updateField = useUpdateDataField();
  const deleteField = useDeleteDataField();
  
  const handleAddField = () => {
    createField.mutate({
      configId,
      name: fieldName,
      selector: fieldSelector,
      status: 'active'
    });
    setIsAddDialogOpen(false);
    setFieldName('');
    setFieldSelector('');
  };
  
  const handleEditField = () => {
    if (!selectedField) return;
    
    updateField.mutate({
      id: selectedField.id,
      field: {
        name: fieldName,
        selector: fieldSelector,
        status: 'active'
      },
      configId
    });
    setIsEditDialogOpen(false);
    setSelectedField(null);
    setFieldName('');
    setFieldSelector('');
  };
  
  const handleDeleteField = (id: number) => {
    deleteField.mutate({ id, configId });
  };
  
  const openEditDialog = (field: DataField) => {
    setSelectedField(field);
    setFieldName(field.name);
    setFieldSelector(field.selector);
    setIsEditDialogOpen(true);
  };
  
  const getFieldIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('name') || lowerName.includes('title') || lowerName.includes('description')) {
      return <FileText className="h-3 w-3 text-primary" />;
    } else if (lowerName.includes('price')) {
      return <DollarSign className="h-3 w-3 text-primary" />;
    } else if (lowerName.includes('rating') || lowerName.includes('review')) {
      return <Star className="h-3 w-3 text-primary" />;
    } else {
      return <MonitorSmartphone className="h-3 w-3 text-primary" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ) : (
        <div className="space-y-3">
          {fields.length > 0 ? (
            fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-2">
                      {getFieldIcon(field.name)}
                    </div>
                    <span className="font-medium text-sm">{field.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8">
                    {field.selector}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-800">
                    {field.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(field)}>
                    <Pencil className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the field "{field.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteField(field.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
              <MonitorSmartphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No data fields defined yet</p>
              <p className="text-xs mt-1">Add fields to extract specific data from the target website</p>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary flex items-center justify-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add New Field
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Data Field</DialogTitle>
            <DialogDescription>
              Define a new data field to extract from the website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="e.g. Product Name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldSelector">CSS Selector</Label>
              <Input
                id="fieldSelector"
                placeholder="e.g. .product-title h1"
                value={fieldSelector}
                onChange={(e) => setFieldSelector(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter a CSS selector to target the element on the page.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddField} disabled={!fieldName || !fieldSelector}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Field</DialogTitle>
            <DialogDescription>
              Update the data field properties.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editFieldName">Field Name</Label>
              <Input
                id="editFieldName"
                placeholder="e.g. Product Name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editFieldSelector">CSS Selector</Label>
              <Input
                id="editFieldSelector"
                placeholder="e.g. .product-title h1"
                value={fieldSelector}
                onChange={(e) => setFieldSelector(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter a CSS selector to target the element on the page.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditField} disabled={!fieldName || !fieldSelector}>Update Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
