import React from "react";
import "./CategoryFilter.css";

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-button ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => onCategoryChange(category)}>
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
