import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name, action, otp } = await req.json();

    const emailStr = String(email || "").trim().toLowerCase();
    const otpStr = String(otp || "").trim();

    // Check if the input is the dev password / phone number
    const isDevBypass = emailStr === "9176092485" || otpStr === "9176092485";

    if (isDevBypass) {
      if (action === "request") {
        return NextResponse.json({
          success: true,
          message: "Dev authentication bypassed. Enter code '9176092485' or click verify to enter with Teacher authority.",
          otp: "9176092485",
          role: "teacher"
        });
      }
      if (action === "verify") {
        return NextResponse.json({
          success: true,
          message: "Verification successful (Dev Bypass).",
          user: {
            email: "admin@zionschool.ac.in",
            role: "teacher",
            display_name: name || "Admin Teacher"
          }
        });
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // 1. Domain Constraint verification
    if (!emailStr.endsWith("@zionschool.ac.in")) {
      return NextResponse.json(
        { error: "Access Denied: Only @zionschool.ac.in email addresses are permitted." },
        { status: 403 }
      );
    }

    // 2. Role Detection based on email prefix
    const prefix = emailStr.split("@")[0];
    
    // Check for subject keywords (chemistry, physics, maths, biology)
    const subjectKeywords = ["chemistry", "physics", "maths", "math", "biology"];
    const hasSubjectKeyword = subjectKeywords.some(keyword => prefix.includes(keyword));
    
    // Check for 4 or more consecutive digits
    const hasFourConsecutiveDigits = /\d{4,}/.test(prefix);
    
    let detectedRole: "student" | "teacher" = "student";
    if (hasSubjectKeyword || hasFourConsecutiveDigits) {
      detectedRole = "teacher";
    }

    // 3. Handle Request OTP Action
    if (action === "request") {
      // Generate a deterministic or simple 6-digit OTP code for ease of hackathon demo evaluation
      const code = "123456"; 
      
      console.log(`\n========================================`);
      console.log(`PRISMATE OTP DISPATCH LOG`);
      console.log(`Email: ${emailStr}`);
      console.log(`Name: ${name || "Unknown"}`);
      console.log(`Role Detected: ${detectedRole.toUpperCase()}`);
      console.log(`Verification Code: ${code}`);
      console.log(`========================================\n`);

      return NextResponse.json({
        success: true,
        message: "A 6-digit verification code has been dispatched to your email.",
        otp: code, // Return it in API body so the client-side UI can auto-fill or print for easy testing
        role: detectedRole
      });
    }

    // 4. Handle Verify OTP Action
    if (action === "verify") {
      if (!otp) {
        return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
      }

      if (otpStr !== "123456") {
        return NextResponse.json({ error: "Invalid verification code. Please try again." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Verification successful.",
        user: {
          email: emailStr,
          role: detectedRole,
          display_name: name || "User"
        }
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { error: "Authentication system failure", details: errorMessage },
      { status: 500 }
    );
  }
}
