const navigations = [
  {
    name: "Calibration",
    icon: "fact_check",
    children: [
      {
        name: "Dashboard",
        iconText: "DB",
        path: "/dashboard"
      },
      {
        name: "Plans",
        iconText: "PL",
        path: "/calibration-plans"
      },
      {
        name: "Actuals",
        iconText: "AC",
        path: "/calibration-actuals"
      },
      {
        name: "Equipments",
        iconText: "EQ",
        path: "/equipments"
      },
      {
        name: "Master Data",
        iconText: "MD",
        path: "/master-data"
      },
      {
        name: "Users",
        iconText: "US",
        path: "/users"
      }
    ]
  },
  {
    name: "Account",
    icon: "manage_accounts",
    children: [
      {
        name: "My Profile",
        iconText: "PF",
        path: "/account/profile"
      },
      {
        name: "Change Password",
        iconText: "CP",
        path: "/account/change-password"
      }
    ]
  }
];

export default navigations;
