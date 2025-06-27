// utils/helpers.js
// Generate a random ID for thoughts and comments
export const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  // Format timestamp to a readable date
  export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Categories for thoughts
  export const categories = [
    'Academic',
    'Personal',
    'Funny',
    'Rant',
    'Question',
    'Other'
  ];