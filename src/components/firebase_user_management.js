import { database } from "../firebase";
import { ref, set, get, update } from "firebase/database";

// Function to add a user to the database
const addUser = async (userId, userDetails) => {
  const userRef = ref(database, `users/${userId}`);
  await set(userRef, userDetails);
  console.log("User added successfully!");
};

// Function to approve an artist after checking their role
const approveArtist = async (userId) => {
  const userRef = ref(database, `users/${userId}`);
  const userSnapshot = await get(userRef);

  if (userSnapshot.exists() && userSnapshot.val().role === "artist") {
    await update(userRef, { isApproved: true });
    console.log("Artist approved successfully!");
  } else {
    console.log("No artist found or already approved.");
  }
};

// Function to add an admin, ensuring the limit of 4 is respected
// Function to add an admin, ensuring the limit of 4 is respected
const addAdmin = async (adminId, email, name, password) => {
  const adminsRef = ref(database, "admins");
  const adminsSnapshot = await get(adminsRef);

  // Check if the number of admins is less than 4
  if (
    !adminsSnapshot.exists() ||
    Object.keys(adminsSnapshot.val()).length < 4
  ) {
    // Store email, name, and password for the admin
    await set(ref(database, `admins/${adminId}`), { email, name, password });
    console.log("Admin added successfully!");
  } else {
    console.log("Cannot add more than 4 admins.");
  }
};

// Function to validate admin credentials
// Function to validate admin credentials
const validateAdminCredentials = async (email, password) => {
  const adminsRef = ref(database, "admins");
  const snapshot = await get(adminsRef);

  if (snapshot.exists()) {
    const admins = snapshot.val();
    for (const adminId in admins) {
      if (
        admins[adminId].email === email &&
        admins[adminId].password === password // Now comparing the password
      ) {
        return true; // Credentials match
      }
    }
  }

  return false; // No match found
};

// Function to register a new user with a specific role
const registerUser = async (userId, username, email, role) => {
  const newUser = {
    username,
    email,
    role,
    isApproved: role === "artist" ? false : true, // Only artists require approval
  };
  await addUser(userId, newUser);
};

// Export all functions except getAdmins
export {
  addUser,
  approveArtist,
  addAdmin,
  registerUser,
  validateAdminCredentials,
};
