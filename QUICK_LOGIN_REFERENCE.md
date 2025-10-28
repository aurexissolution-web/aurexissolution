# 🔑 Quick Login Reference Card

## 📋 All Test Credentials

### 🔴 Admin & Management
| Role | Email/ID | Password | Dashboard |
|------|----------|----------|-----------|
| **Admin** | `admin@aurexissolution.com` | `Aurexis3129` | `/admin` |
| **HR Manager** | `hr@aurexissolution.com` | `HRPass123` | `/hr` |
| **Manager** | `manager@aurexissolution.com` | `ManagerPass123` | `/employee-dashboard` |

---

### 💼 Department Heads
| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Finance Executive** | `finance@aurexissolution.com` | `FinancePass123` | `/employee-dashboard` |
| **Marketing Head** | `marketing@aurexissolution.com` | `MarketingPass123` | `/employee-dashboard` |

---

### 👥 Team Leads
| Role | Email | Password | Team | Dashboard |
|------|-------|----------|------|-----------|
| **Team Lead 1** | `teamlead1@aurexissolution.com` | `TeamLead123` | Dev Team A | `/employee-dashboard` |
| **Team Lead 2** | `teamlead2@aurexissolution.com` | `TeamLead456` | Dev Team B | `/employee-dashboard` |

---

### 👨‍💻 Normal Employees
| Role | Email | Password | Department | Dashboard |
|------|-------|----------|------------|-----------|
| **Employee 1** | `employee1@aurexissolution.com` | `Employee123` | Engineering | `/employee-dashboard` |
| **Employee 2** | `employee2@aurexissolution.com` | `Employee456` | Engineering | `/employee-dashboard` |
| **Employee 3** | `employee3@aurexissolution.com` | `Employee789` | Marketing | `/employee-dashboard` |

---

### 🤝 Customers
| Role | Unique ID | Password | Projects | Dashboard |
|------|-----------|----------|----------|-----------|
| **Customer 1** | `CUST001` | `CustomerPass123` | 2 Active | `/customer-dashboard` |
| **Customer 2** | `CUST002` | `CustomerPass456` | 1 Pending | `/customer-dashboard` |
| **Customer 3** | `CUST003` | `CustomerPass789` | 1 Completed | `/customer-dashboard` |

---

### 💪 Freelancer
| Role | Unique ID | Password | Dashboard |
|------|-----------|----------|-----------|
| **Freelancer** | `FREE001` | `Freelance123` | `/freelancer-dashboard` |

---

## 🎯 Quick Test Paths

### Most Feature-Rich Accounts
1. **CUST001** - Best for testing customer features (2 projects, invoices, attachments, payments)
2. **admin@aurexissolution.com** - Full system access
3. **teamlead1@aurexissolution.com** - Customer project assignment testing

### Best for Specific Testing
- **Payment Flow**: CUST001, finance@aurexissolution.com
- **Project Assignment**: admin, teamlead1@aurexissolution.com, CUST001
- **HR Analytics**: hr@aurexissolution.com
- **Invoice Management**: admin, CUST001, CUST002

---

## 🚀 Quick Start

### For Admin Testing
```
1. Go to login page
2. Click "Admin" button
3. Email: admin@aurexissolution.com
4. Password: Aurexis3129
5. Click Login
```

### For Customer Testing
```
1. Go to login page  
2. Click "Customer" button
3. Unique ID: CUST001
4. Password: CustomerPass123
5. Click Login
```

### For Employee Testing
```
1. Go to login page
2. Click "Admin" or "HR" button (employees use email login)
3. Email: teamlead1@aurexissolution.com
4. Password: TeamLead123
5. Click Login
→ Will be redirected to /employee-dashboard
```

---

## 📊 Data Summary by User

### CUST001 (Most Complete)
- ✅ 2 Projects (E-Commerce, Mobile App)
- ✅ 2 Invoices (1 paid, 1 sent)
- ✅ 1 Quotation (accepted)
- ✅ 3 Attachments (2 approved, 1 pending)
- ✅ 2 Project Requests (both approved)
- ✅ 2 Payment Receipts
- ✅ 2 Payment Invoices

### CUST002 (Pending Status)
- ⏳ 1 Project (CRM System - Pending)
- 📝 1 Invoice (Draft)
- 📝 1 Quotation (Sent)
- ✅ 1 Attachment (approved)
- ⏳ 1 Payment Receipt (pending)

### CUST003 (Completed)
- ✅ 1 Project (SEO Campaign - Completed)
- ✅ 1 Payment Receipt (verified)
- ✅ 1 Payment Invoice (paid)
- ✅ 1 Project Feedback

---

## 💡 Pro Tips

1. **Start with CUST001** - Most data, best for comprehensive testing
2. **Use Admin** - To see system-wide view of all data
3. **Test Team Lead 1** - To see customer project assignment flow
4. **Try Finance Executive** - To test payment verification workflow
5. **Check HR Dashboard** - To see analytics with mock data

---

## 🔄 Password Notes

- **Admin/HR/Employees**: Use **email** for login
- **Customers/Freelancers**: Use **Unique ID** for login
- All passwords are **case-sensitive**
- CUST001 & CUST003 may have changed passwords (try both provided)

---

## 📞 Support

For detailed testing scenarios, see: `MOCK_DATA_TESTING_GUIDE.md`

For full mock data structure, see: `data/mockData.ts`

---

**Last Updated**: October 27, 2025  
**Total Mock Users**: 16  
**Total Mock Projects**: 7  
**Total Mock Data Records**: 40+

