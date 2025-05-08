// utils/generateUsername.js
const  GenerateUsername = (name) => {
    const base = name.toLowerCase().replace(/\s+/g, ''); // remove spaces, lowercase
    const random = Math.floor(1000 + Math.random() * 9000); // random 4-digit number
    return `${base}${random}`;
  };
  

  export default  GenerateUsername ;