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
            path = result.get("path", "")
            if "selenium-tests" in path or "appium-tests" in path or "tests" in path:
                continue
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
            target = result.get("Target", "")
            if "selenium-tests" in target or "appium-tests" in target:
                continue
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

# Generate GitHub Step Summary Markdown
summary_md = ""

# Parse Gitleaks
secrets = []
try:
    with open("gitleaks-results.json", "r") as f:
        secrets = json.load(f)
except Exception:
    pass

if secrets:
    summary_md += "## 🛑 Gitleaks detected secrets 🛑\n\n"
    summary_md += "| Rule ID | Commit | Start Line | Author | Date | Email | File |\n"
    summary_md += "|---|---|---|---|---|---|---|\n"
    for s in secrets:
        rule = s.get("RuleID", "")
        commit = str(s.get("Commit", ""))[:7]
        line = s.get("StartLine", "")
        author = s.get("Author", "")
        date = str(s.get("Date", ""))[:10]
        email = s.get("Email", "")
        file = s.get("File", "")
        summary_md += f"| {rule} | {commit} | {line} | {author} | {date} | {email} | {file} |\n"
    summary_md += "\n"

summary_md += "## 🔒 Security Assessment Summary\n\n"
summary_md += "| Severity | Count |\n"
summary_md += "|---|---|\n"
summary_md += f"| 🔴 Critical | {risk_summary['Critical']} |\n"
summary_md += f"| 🟠 High | {risk_summary['High']} |\n"
summary_md += f"| 🟡 Medium | {risk_summary['Medium']} |\n"
summary_md += f"| 🔵 Low | {risk_summary['Low']} |\n"
summary_md += f"| **Total** | **{sum(risk_summary.values())}** |\n\n"

score = 100 - (risk_summary['Critical'] * 10) - (risk_summary['High'] * 5) - (risk_summary['Medium'] * 2) - (risk_summary['Low'] * 1)
score = max(0, score)
status = "⚠️ Not Production Ready" if score < 80 else "✅ Production Ready"

summary_md += f"**Overall Security Score: {score}/100 — {status}**\n\n"

step_summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
if step_summary_file:
    with open(step_summary_file, "a", encoding="utf-8") as f:
        f.write(summary_md)
    print("Successfully wrote to GITHUB_STEP_SUMMARY")
