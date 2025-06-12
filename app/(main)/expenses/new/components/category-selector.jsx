"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";

const CategorySelector = ({ categories, onChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (onChange && categoryId !== selectedCategory) {
      onChange(categoryId);
    }
  };
  if (!categories || categories.length === 0) {
    return <div>No categories avalible</div>;
  }
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const defaultCategory =
        categories.find((cat) => cat.isDefault) || categories[0];
      setTimeout(() => {
        setSelectedCategory(defaultCategory.id);
        if (onChange) {
          onChange(defaultCategory.id);
        }
      }, 0);
    }
  }, []);

  return (
    <div>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2 ">
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
