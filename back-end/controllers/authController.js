import supabase from "../supabaseClient.js";
import { generateToken } from "../utils/jwtUtils.js";

/**
 * Register a new user
 * UX Refinement: Auto-generate account number on first login
 */
export async function register(req, res) {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: "Email, password, and fullName are required"
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists"
      });
    }

    // Insert new user (password hashing would happen in production)
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password, // In production, use bcrypt to hash
          full_name: fullName,
          account_number: generateAccountNumber(),
          account_balance: 50000, // Demo balance
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }

    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        accountNumber: newUser.account_number,
        accountBalance: newUser.account_balance
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // In production, use bcrypt to compare passwords
    if (user.password !== password) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        accountNumber: user.account_number,
        accountBalance: user.account_balance
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, full_name, account_number, account_balance, created_at")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        accountNumber: user.account_number,
        accountBalance: user.account_balance,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

/**
 * Helper: Generate account number
 */
function generateAccountNumber() {
  return "OCBC" + Math.random().toString().slice(2, 13);
}
