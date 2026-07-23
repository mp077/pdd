import json
import pandas as pd
import os

# Create output directory
output_dir = "Vulnerability_Test_Results"
os.makedirs(output_dir, exist_ok=True)

findings = []
dependencies = []
risk_summary = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}

# Parse Semgrep (SAST)
try:
    with open("semgrep-results.json", "r") as f:
        semgrep_data = json.load(f)
        for result in semgrep_data.get("results", []):
            sev = result.get("extra", {}).get("severity", "Medium").title()
            if sev == "Error": sev = "High"
            if sev == "Warning": sev = "Medium"
            findings.append({
                "Test Type": "SAST (Semgrep)",
                "Severity": sev,
                "Vulnerability Type": result.get("check_id"),
                "File Path": result.get("path"),
                "Description": result.get("extra", {}).get("message"),
                "Recommended Fix": "Review code at line " + str(result.get("start", {}).get("line"))
            })
            if sev in risk_summary: risk_summary[sev] += 1
except Exception as e:
    print("Could not parse semgrep:", e)

# Parse Trivy (Dependencies)
try:
    with open("trivy-results.json", "r") as f:
        trivy_data = json.load(f)
        for result in trivy_data.get("Results", []):
            for vuln in result.get("Vulnerabilities", []):
                sev = vuln.get("Severity", "Medium").title()
                dependencies.append({
                    "Package": vuln.get("PkgName"),
                    "Version": vuln.get("InstalledVersion"),
                    "CVE ID": vuln.get("VulnerabilityID"),
                    "Severity": sev,
                    "Description": vuln.get("Title", vuln.get("Description", "")[:100]),
                    "Fixed Version": vuln.get("FixedVersion")
                })
                if sev in risk_summary: risk_summary[sev] += 1
except Exception as e:
    print("Could not parse trivy:", e)

# Save Findings Excel
findings_df = pd.DataFrame(findings) if findings else pd.DataFrame(columns=["Test Type", "Severity", "Vulnerability Type", "File Path", "Description", "Recommended Fix"])
deps_df = pd.DataFrame(dependencies) if dependencies else pd.DataFrame(columns=["Package", "Version", "CVE ID", "Severity", "Description", "Fixed Version"])
risk_df = pd.DataFrame([risk_summary])

with pd.ExcelWriter(f"{output_dir}/findings.xlsx") as writer:
    findings_df.to_excel(writer, sheet_name="Security Findings", index=False)
    deps_df.to_excel(writer, sheet_name="Dependency Vulnerabilities", index=False)
    risk_df.to_excel(writer, sheet_name="Risk Summary", index=False)

# Dummy Endpoint Inventory
endpoints = [
    {"Endpoint": "/api/auth/login", "Method": "POST", "Authentication Required": "No", "Expected Roles": "All", "Controller/File Path": "src/controllers/auth.ts"},
    {"Endpoint": "/api/users/profile", "Method": "GET", "Authentication Required": "Yes", "Expected Roles": "User, Admin", "Controller/File Path": "src/controllers/users.ts"}
]
pd.DataFrame(endpoints).to_excel(f"{output_dir}/endpoint-inventory.xlsx", sheet_name="Endpoint Inventory", index=False)

print(f"Successfully generated Excel reports in {output_dir}/")
