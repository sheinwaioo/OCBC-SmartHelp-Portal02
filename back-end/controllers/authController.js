import supabase from "../supabaseClient.js";
import { generateToken } from "../utils/jwtUtils.js";

/**
 * Register a new customer
 * Creates customer in Team's customer table with demo account
 */
export async function register(req, res) {
  try {
    const { email, password, name, mobileNumber } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required"
      });
    }

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("customer")
      .select("customer_id")
      .eq("email", email)
      .single();

    if (existingCustomer) {
      return res.status(409).json({
        error: "Customer with this email already exists"
      });
    }

    // Insert new customer (Team's schema)
    const { data: newCustomer, error: registerError } = await supabase
      .from("customer")
      .insert([
        {
          email,
          password, // In production, use bcrypt to hash
          name,
          mobile_number: mobileNumber || null,
          address: null,
          pin_number: null,
          TotpSecret: null,
          IsMfaVerified: false,
          joined_at: new Date()
        }
      ])
      .select()
      .single();

    if (registerError) {
      console.error("Supabase error:", registerError);
      return res.status(500).json({ error: "Failed to create customer" });
    }

    // Create demo account for customer
    const accountNumber = generateAccountNumber();
    const { error: accountError } = await supabase
      .from("account")
      .insert([
        {
          account_number: accountNumber,
          customer_id: newCustomer.customer_id,
          balance: 50000.00,
          transaction_limit: 100000.00,
          type: "SAVINGS",
          created_at: new Date()
        }
      ]);

    if (accountError) {
      console.error("Account creation error:", accountError);
      // Continue anyway - customer created even if account creation fails
    }

    const token = generateToken(newCustomer.customer_id, newCustomer.email);

    res.status(201).json({
      token,
      user: {
        customerId: newCustomer.customer_id,
        email: newCustomer.email,
        name: newCustomer.name,
        mobileNumber: newCustomer.mobile_number,
        accountNumber: accountNumber
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

/**
 * Login customer
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Get customer from database (Team's schema)
    const { data: customer, error } = await supabase
      .from("customer")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Database query error:", error);
      return res.status(401).json({
        error: "Invalid email or password",
        debug: error.message
      });
    }

    if (!customer) {
      console.error("Customer not found for email:", email);
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // In production, use bcrypt to compare passwords
    if (customer.password !== password) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Get customer's account
    const { data: account } = await supabase
      .from("account")
      .select("account_number, balance")
      .eq("customer_id", customer.customer_id)
      .single();

    const token = generateToken(customer.customer_id, customer.email);

    res.json({
      token,
      user: {
        customerId: customer.customer_id,
        email: customer.email,
        name: customer.name,
        mobileNumber: customer.mobile_number,
        accountNumber: account?.account_number || null,
        accountBalance: account?.balance || 0
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Get current customer profile
 */
export async function getProfile(req, res) {
  try {
    const customerId = req.user.userId;

    const { data: customer, error } = await supabase
      .from("customer")
      .select("customer_id, email, name, mobile_number, address, joined_at")
      .eq("customer_id", customerId)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get customer's account
    const { data: account } = await supabase
      .from("account")
      .select("account_number, balance, type")
      .eq("customer_id", customerId)
      .single();

    res.json({
      user: {
        customerId: customer.customer_id,
        email: customer.email,
        name: customer.name,
        mobileNumber: customer.mobile_number,
        address: customer.address,
        joinedAt: customer.joined_at,
        accountNumber: account?.account_number || null,
        accountBalance: account?.balance || 0,
        accountType: account?.type || null
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
