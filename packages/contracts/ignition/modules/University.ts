import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UNIVERSITY_NAME = "University of Hardhat";

const UniversityModule = buildModule("UniversityModule", (m) => {
  const universityName = m.getParameter("universityName", UNIVERSITY_NAME);

  const university = m.contract("University", [universityName]);

  return { university, contract: university };
});

export default UniversityModule;
