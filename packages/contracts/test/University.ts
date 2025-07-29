import hre from "hardhat";
import { expect } from "chai";
import { getAddress } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("University", () => {
  const deployFixture = async () => {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const name = "University of Hardhat";

    const university = await hre.viem.deployContract("University", [name]);

    return {
      owner,
      otherAccount,
      name,
      university,
    };
  };

  const universitDataFixture = async () => {
    let campusId = 0;
    let careerId = 0;
    let pensumId = 0;
    let subjectId = 0;

    return Array.from({ length: 5 }).map(() => ({
      id: BigInt(++campusId),
      name: `Campus ${campusId}`,
      careers: Array.from({ length: 5 }).map(() => ({
        id: BigInt(++careerId),
        name: `Career ${careerId}`,
        pensums: Array.from({ length: 5 }).map(() => ({
          id: BigInt(++pensumId),
          subjects: Array.from({ length: 5 }).map(() => ({
            id: BigInt(++subjectId),
            name: `Subject ${subjectId}`,
            credits: 3,
            semester: 1,
          })),
        })),
      })),
    }));
  };

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { university, owner } = await loadFixture(deployFixture);
      expect(await university.read.owner()).to.equal(
        getAddress(owner.account.address),
      );
    });

    it("Should set the right name", async () => {
      const { university, name } = await loadFixture(deployFixture);
      expect(await university.read.name()).to.equal(name);
    });

    it("Should set the right nextCampusId", async () => {
      const { university } = await loadFixture(deployFixture);
      expect(await university.read.nextCampusId()).to.equal(1n);
    });

    it("Should set the right nextCareerId", async () => {
      const { university } = await loadFixture(deployFixture);
      expect(await university.read.nextCareerId()).to.equal(1n);
    });

    it("Should set the right nextPensumId", async () => {
      const { university } = await loadFixture(deployFixture);
      expect(await university.read.nextPensumId()).to.equal(1n);
    });

    it("Should set the right nextSubjectId", async () => {
      const { university } = await loadFixture(deployFixture);
      expect(await university.read.nextSubjectId()).to.equal(1n);
    });
  });

  describe("Campus", () => {
    it("Should create a campus", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const [id, name] = await university.read.campuses([nextCampusId]);
      expect(id).to.equal(nextCampusId);
      expect(name).to.equal(campusName);
    });

    it("Should revert if user is not the owner", async () => {
      const { university, otherAccount } = await loadFixture(deployFixture);

      const campusName = "Campus 1";
      await expect(
        university.write.addCampus([campusName], {
          account: otherAccount.account,
        }),
      ).to.be.rejectedWith("Only the owner can call this function");
    });

    it("Should revert if campus name is empty", async () => {
      const { university } = await loadFixture(deployFixture);

      await expect(university.write.addCampus([""])).to.be.rejectedWith(
        "Campus name cannot be empty",
      );
    });

    it("Should revert if campus name is too long", async () => {
      const { university } = await loadFixture(deployFixture);

      const longName = "a".repeat(101);

      await expect(university.write.addCampus([longName])).to.be.rejectedWith(
        "Campus name cannot be longer than 100 characters",
      );
    });
  });

  describe("Career", () => {
    it("Should create a career", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const nextCareerId = await university.read.nextCareerId();
      const careerName = "Career 1";
      await university.write.addCareer([nextCampusId, careerName]);

      const [id, name] = await university.read.careers([nextCareerId]);
      expect(id).to.equal(nextCareerId);
      expect(name).to.equal(careerName);
    });

    it("Should read careers by campus", async () => {
      const { university } = await loadFixture(deployFixture);
      const campuses = await loadFixture(universitDataFixture);

      for (const campus of campuses) {
        await university.write.addCampus([campus.name]);
        for (const career of campus.careers) {
          await university.write.addCareer([campus.id, career.name]);
        }
      }

      for (let i = 0; i < campuses.length; i++) {
        const campus = campuses[i];
        const careersCount = await university.read.campusCareersCount([
          campus.id,
        ]);

        expect(careersCount).to.equal(BigInt(campus.careers.length));

        for (let j = 0; j < campus.careers.length; j++) {
          const campusCareer = campus.careers[j];
          const careerId = await university.read.campusCareers([
            campus.id,
            BigInt(j),
          ]);
          const [id, name] = await university.read.careers([careerId]);

          expect(id).to.equal(campusCareer.id);
          expect(name).to.equal(campusCareer.name);
        }
      }
    });

    it("Should revert if user is not the owner", async () => {
      const { university, otherAccount } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const careerName = "Career 1";
      await expect(
        university.write.addCareer([nextCampusId, careerName], {
          account: otherAccount.account,
        }),
      ).to.be.rejectedWith("Only the owner can call this function");
    });

    it("Should revert if career name is empty", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      await expect(
        university.write.addCareer([nextCampusId, ""]),
      ).to.be.rejectedWith("Career name cannot be empty");
    });

    it("Should revert if career name is too long", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const longName = "a".repeat(101);

      await expect(
        university.write.addCareer([nextCampusId, longName]),
      ).to.be.rejectedWith("Career name cannot be longer than 100 characters");
    });

    it("Should revert if campus does not exist", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const careerName = "Career 1";

      await expect(
        university.write.addCareer([nextCampusId, careerName]),
      ).to.be.rejectedWith("Campus does not exist");
    });
  });

  describe("Pensum", () => {
    it("Should create a pensum", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const nextCareerId = await university.read.nextCareerId();
      const careerName = "Career 1";
      await university.write.addCareer([nextCampusId, careerName]);

      const nextPensumId = await university.read.nextPensumId();
      const pensumSubjects = Array.from({ length: 10 }).map((_, i) => ({
        id: BigInt(0),
        name: `Subject ${i + 1}`,
        credits: 3,
        semester: 1,
      }));

      await university.write.addPensum([nextCareerId, pensumSubjects]);

      const [id] = await university.read.pensums([nextPensumId]);

      expect(id).to.equal(nextPensumId);
    });

    it("Should read pensums by career", async () => {
      const { university } = await loadFixture(deployFixture);
      const campuses = await loadFixture(universitDataFixture);

      for (const campus of campuses) {
        await university.write.addCampus([campus.name]);
        for (const career of campus.careers) {
          await university.write.addCareer([campus.id, career.name]);
          for (const pensum of career.pensums) {
            await university.write.addPensum([career.id, pensum.subjects]);
          }
        }
      }

      for (const campus of campuses) {
        for (const career of campus.careers) {
          const pensumsCount = await university.read.careerPensumsCount([
            career.id,
          ]);
          expect(pensumsCount).to.equal(BigInt(career.pensums.length));

          for (let k = 0; k < career.pensums.length; k++) {
            const pensum = career.pensums[k];
            const pensumId = await university.read.careerPensums([
              career.id,
              BigInt(k),
            ]);
            const [id, careerId] = await university.read.pensums([pensumId]);

            expect(id).to.equal(pensum.id);
            expect(careerId).to.equal(career.id);
          }
        }
      }
    });

    it("Should revert if user is not the owner", async () => {
      const { university, otherAccount } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const nextCareerId = await university.read.nextCareerId();
      const careerName = "Career 1";
      await university.write.addCareer([nextCampusId, careerName]);

      const pensumSubjects = Array.from({ length: 10 }).map((_, i) => ({
        id: BigInt(0),
        name: `Subject ${i + 1}`,
        credits: 3,
        semester: 1,
      }));

      await expect(
        university.write.addPensum([nextCareerId, pensumSubjects], {
          account: otherAccount.account,
        }),
      ).to.be.rejectedWith("Only the owner can call this function");
    });

    it("Should revert if career does not exist", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCareerId = await university.read.nextCareerId();
      const pensumSubjects = Array.from({ length: 10 }).map((_, i) => ({
        id: BigInt(0),
        name: `Subject ${i + 1}`,
        credits: 3,
        semester: 1,
      }));

      await expect(
        university.write.addPensum([nextCareerId, pensumSubjects]),
      ).to.be.rejectedWith("Career does not exist");
    });

    it("Should revert if pensum subjects are empty", async () => {
      const { university } = await loadFixture(deployFixture);

      const nextCampusId = await university.read.nextCampusId();
      const campusName = "Campus 1";
      await university.write.addCampus([campusName]);

      const nextCareerId = await university.read.nextCareerId();
      const careerName = "Career 1";
      await university.write.addCareer([nextCampusId, careerName]);

      await expect(
        university.write.addPensum([nextCareerId, []]),
      ).to.be.rejectedWith("Pensum must have at least one subject");
    });
  });

  describe("Subject", () => {
    it("Should create pensum subjects", async () => {
      const { university } = await loadFixture(deployFixture);
      const campuses = await loadFixture(universitDataFixture);

      for (const campus of campuses) {
        await university.write.addCampus([campus.name]);
        for (const career of campus.careers) {
          await university.write.addCareer([campus.id, career.name]);
          for (const pensum of career.pensums) {
            await university.write.addPensum([career.id, pensum.subjects]);
          }
        }
      }

      for (const campus of campuses) {
        for (const career of campus.careers) {
          for (const pensum of career.pensums) {
            const [pensumId] = await university.read.pensums([pensum.id]);
            const subjectsCount = await university.read.pensumSubjectsCount([
              pensumId,
            ]);

            expect(subjectsCount).to.equal(BigInt(pensum.subjects.length));

            for (let i = 0; i < pensum.subjects.length; i++) {
              const subject = pensum.subjects[i];
              const subjectId = await university.read.pensumSubjects([
                pensumId,
                BigInt(i),
              ]);

              const [id, credits, semester, name] =
                await university.read.subjects([subjectId]);

              expect(id).to.equal(subject.id);
              expect(credits).to.equal(subject.credits);
              expect(semester).to.equal(subject.semester);
              expect(name).to.equal(subject.name);
            }
          }
        }
      }
    });
    it("Should read pensum subjects", () => {});
  });

  describe("User", () => {
    it("Should add a new user", async () => {
      const { university, otherAccount } = await loadFixture(deployFixture);

      const currentWallet = getAddress(otherAccount.account.address);
      const roles = [0, 1, 2, 3, 4, 5];
      await university.write.addUser([currentWallet, roles]);

      const result = await university.read.getUser([currentWallet]);

      expect(result).to.deep.equal({
        currentWallet: getAddress(currentWallet),
        previousWallets: [],
        roles,
      });
    });
    it("Should read pensum subjects", () => {});
  });
});
