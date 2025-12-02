import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1662449686757 implements MigrationInterface {
  name = 'InitialMigration1662449686757';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`account_user_token\`
                             (
                                 \`id\`        varchar(36)   NOT NULL,
                                 \`token\`     varchar(1024) NOT NULL,
                                 \`tokenType\` varchar(255)  NOT NULL,
                                 \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`userId\`    varchar(36) NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`document_data\`
                             (
                                 \`id\`                       varchar(36) NOT NULL,
                                 \`mlResponse\`               json        NOT NULL,
                                 \`sourceData\`               json        NOT NULL,
                                 \`extractedData\`            json        NOT NULL,
                                 \`editedData\`               json        NOT NULL,
                                 \`createdAt\`                datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`chargeCodeConfig\`         json NULL,
                                 \`occupancyConfig\`          json NULL,
                                 \`floorPlanConfig\`          json NULL,
                                 \`lastUsedRenovatedConfig\`  json NULL,
                                 \`lastUsedAffordableConfig\` json NULL,
                                 \`lastUsedMtmConfig\`        json NULL,
                                 \`documentId\`               varchar(36) NULL,
                                 UNIQUE INDEX \`REL_2ad82a0050fa7377d911869b8b\` (\`documentId\`),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`document\`
                             (
                                 \`id\`           varchar(36)  NOT NULL,
                                 \`name\`         varchar(255) NOT NULL,
                                 \`storagePath\`  varchar(255) NOT NULL,
                                 \`documentType\` varchar(32)  NOT NULL,
                                 \`startPage\`    int          NOT NULL,
                                 \`endPage\`      int          NOT NULL,
                                 \`status\`       varchar(32)  NOT NULL,
                                 \`periodFrom\`   varchar(255) NULL,
                                 \`periodTo\`     varchar(255) NULL,
                                 \`asOnDate\`     varchar(255) NULL,
                                 \`createdAt\`    datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`dealId\`       varchar(36) NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`deal_details\`
                             (
                                 \`id\`                     varchar(36) NOT NULL,
                                 \`purchasePrice\`          decimal(12, 2) NULL,
                                 \`fund\`                   decimal(12, 2) NULL,
                                 \`bidDueDate\`             varchar(10) NULL,
                                 \`startOfOperations\`      varchar(10) NULL,
                                 \`numUnits\`               int         NOT NULL,
                                 \`totalArea\`              decimal(10, 2) NULL,
                                 \`buildingType\`           varchar(255) NULL,
                                 \`ageRestricted\`          varchar(255) NULL,
                                 \`affordabilityStatus\`    varchar(255) NULL,
                                 \`dateBuilt\`              varchar(10) NOT NULL,
                                 \`dateRenovated\`          varchar(10) NULL,
                                 \`affordableUnitsPercent\` decimal(5, 2) NULL,
                                 \`noOfBuildings\`          int NULL,
                                 \`noOfStories\`            int NULL,
                                 \`assetQuality\`           varchar(1) NULL,
                                 \`propertyManager\`        varchar(255) NULL,
                                 \`sizeAcres\`              int NULL,
                                 \`parkingSpaces\`          int NULL,
                                 \`hasElevator\`            tinyint NULL,
                                 \`hasFitnessCenter\`       tinyint NULL,
                                 \`hasDoorman\`             tinyint NULL,
                                 \`hasPool\`                tinyint NULL,
                                 \`hasWaterFront\`          tinyint NULL,
                                 \`hasSpa\`                 tinyint NULL,
                                 \`hasRoofDeck\`            tinyint NULL,
                                 \`hasOtherAmenities\`      tinyint NULL,
                                 \`expectedPurchasePrice\`  decimal(10, 2) NULL,
                                 \`equityMultiple\`         int NULL,
                                 \`requiredEquity\`         decimal(10, 2) NULL,
                                 \`leveragedIRR\`           int NULL,
                                 \`goingInCapRateFwd\`      decimal(5, 2) NULL,
                                 \`salePrice\`              decimal(10, 2) NULL,
                                 \`saleDate\`               varchar(10) NULL,
                                 \`capRateTrailing\`        decimal(5, 2) NULL,
                                 \`noiTrailing12\`          decimal(10, 2) NULL,
                                 \`buyer\`                  varchar(255) NULL,
                                 \`seller\`                 varchar(255) NULL,
                                 \`broker\`                 varchar(255) NULL,
                                 \`lastSaleDate\`           varchar(10) NULL,
                                 \`lastSalePrice\`          decimal(10, 2) NULL,
                                 \`updatedAt\`              datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                                 \`dealId\`                 varchar(36) NULL,
                                 UNIQUE INDEX \`REL_c95f383f0c04936c11c20a8fc9\` (\`dealId\`),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`assumption\`
                             (
                                 \`id\`                          varchar(36)  NOT NULL,
                                 \`name\`                        varchar(255) NOT NULL,
                                 \`createdAt\`                   datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`updatedAt\`                   datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                                 \`DD_ClosingDate\`              varchar(10) NULL,
                                 \`DD_HoldPeriodYears\`          int NULL,
                                 \`AA_AcquisitionValuation\`     json NULL,
                                 \`DA_DispositionValuation\`     json NULL,
                                 \`DA_TerminalCapRate\`          decimal(5, 2) NULL,
                                 \`CC_TransferTax\`              decimal(5, 2) NULL,
                                 \`CC_BrokerCommission\`         decimal(5, 2) NULL,
                                 \`CC_OtherClosingCosts\`        decimal(5, 2) NULL,
                                 \`OCC_PCAReport\`               decimal(12, 2) NULL,
                                 \`OCC_EnvironmentalReports\`    decimal(12, 2) NULL,
                                 \`OCC_OtherDueDiligence\`       decimal(12, 2) NULL,
                                 \`OCC_BackDuePropertyTaxes\`    decimal(12, 2) NULL,
                                 \`OCC_OutstandingLiens\`        decimal(12, 2) NULL,
                                 \`OCC_OtherAssumedLiabilities\` decimal(12, 2) NULL,
                                 \`OCC_TitleInsuranceBPS\`       decimal(5, 2) NULL,
                                 \`OCC_LegalFees\`               decimal(12, 2) NULL,
                                 \`OCC_ALTASurvey\`              decimal(12, 2) NULL,
                                 \`OCC_DeferredMaintenance\`     decimal(12, 2) NULL,
                                 \`OCC_FindersFeesBPS\`          decimal(5, 2) NULL,
                                 \`OCC_PrepaymentPenalty\`       decimal(12, 2) NULL,
                                 \`OCC_OtherMiscClosingCosts\`   decimal(12, 2) NULL,
                                 \`upfrontFunding\`              tinyint      NOT NULL,
                                 \`IIA_RI_RentIncrement\`        decimal(5, 2) NULL,
                                 \`IIA_RI_MarketRentUnits\`      decimal(5, 2) NULL,
                                 \`IIA_RI_RentControlledUnits\`  decimal(5, 2) NULL,
                                 \`IIA_RI_AffordableUnits\`      decimal(5, 2) NULL,
                                 \`IIA_RI_Section8Units\`        decimal(5, 2) NULL,
                                 \`IIA_RI_OtherUnits\`           decimal(5, 2) NULL,
                                 \`IIA_OtherIncomeInflation\`    decimal(5, 2) NULL,
                                 \`RS_Renovated\`                tinyint      NOT NULL,
                                 \`EA_RealEstateTaxes\`          json NULL,
                                 \`EA_ManagementFees\`           json NULL,
                                 \`EI_GeneralInflation\`         decimal(5, 2) NULL,
                                 \`EI_RealEstateTaxInflation\`   decimal(5, 2) NULL,
                                 \`RR_ProjectedReserves\`        json NULL,
                                 \`RR_GrowAtInflation\`          tinyint      NOT NULL,
                                 \`MTMUnitsStatus\`              varchar(255) NOT NULL DEFAULT 'Occupied',
                                 \`accountId\`                   varchar(36) NULL,
                                 \`userId\`                      varchar(36) NULL,
                                 \`dealId\`                      varchar(36) NULL,
                                 UNIQUE INDEX \`REL_d24254074ba99c7db385ab8648\` (\`dealId\`),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`deal_dictionary\`
                             (
                                 \`id\`         varchar(36) NOT NULL,
                                 \`dictionary\` json        NOT NULL,
                                 \`lineItems\`  json        NOT NULL,
                                 \`createdAt\`  datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`updatedAt\`  datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                                 \`dealId\`     varchar(36) NULL,
                                 UNIQUE INDEX \`REL_70d4af2892b6e1fe1a55bb6a21\` (\`dealId\`),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`model_history\`
                             (
                                 \`id\`        varchar(36)  NOT NULL,
                                 \`name\`      varchar(255) NOT NULL,
                                 \`documents\` json         NOT NULL,
                                 \`modelData\` json         NOT NULL,
                                 \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`dealId\`    varchar(36) NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`deal\`
                             (
                                 \`id\`               varchar(36)  NOT NULL,
                                 \`name\`             varchar(255) NOT NULL,
                                 \`address\`          json         NOT NULL,
                                 \`slug\`             varchar(255) NOT NULL,
                                 \`status\`           varchar(32)  NOT NULL,
                                 \`createdAt\`        datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`updatedAt\`        datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                                 \`accountId\`        varchar(36) NULL,
                                 \`ownedByUserId\`    varchar(36) NULL,
                                 \`assignedToUserId\` varchar(36) NULL,
                                 UNIQUE INDEX \`unique_deal_slug\` (\`accountId\`, \`slug\`),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`account_user\`
                             (
                                 \`id\`              varchar(36)  NOT NULL,
                                 \`clikGatewayId\`   varchar(255) NOT NULL,
                                 \`createdAt\`       datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`userPreferences\` json NULL,
                                 \`accountId\`       varchar(36) NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`account\`
                             (
                                 \`id\`            varchar(36)  NOT NULL,
                                 \`clikGatewayId\` varchar(255) NOT NULL,
                                 \`createdAt\`     datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`super_admin_token\`
                             (
                                 \`id\`        varchar(36)   NOT NULL,
                                 \`token\`     varchar(1024) NOT NULL,
                                 \`tokenType\` varchar(255)  NOT NULL,
                                 \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                                 \`userId\`    varchar(36) NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`super_admin\`
                             (
                                 \`id\`        varchar(36)   NOT NULL,
                                 \`name\`      varchar(255)  NOT NULL,
                                 \`email\`     varchar(255)  NOT NULL,
                                 \`password\`  varchar(2048) NOT NULL,
                                 \`roles\`     json          NOT NULL,
                                 \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6),
                                 \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP (6) ON UPDATE CURRENT_TIMESTAMP (6),
                                 UNIQUE INDEX \`IDX_1ce171ef935f892c7f13004f23\` (\`email\`),
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE=InnoDB`);
    await queryRunner.query(`ALTER TABLE \`account_user_token\`
        ADD CONSTRAINT \`FK_f89b846564d5a35854a95535f06\` FOREIGN KEY (\`userId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`document_data\`
        ADD CONSTRAINT \`FK_2ad82a0050fa7377d911869b8bf\` FOREIGN KEY (\`documentId\`) REFERENCES \`document\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`document\`
        ADD CONSTRAINT \`FK_66abb2bb3ed01f87a42f6eef667\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal_details\`
        ADD CONSTRAINT \`FK_c95f383f0c04936c11c20a8fc97\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`assumption\`
        ADD CONSTRAINT \`FK_23a9160164e1007f9410972bfa6\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`assumption\`
        ADD CONSTRAINT \`FK_d6ac8e85be9ee1d54e95d228c19\` FOREIGN KEY (\`userId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`assumption\`
        ADD CONSTRAINT \`FK_d24254074ba99c7db385ab8648a\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal_dictionary\`
        ADD CONSTRAINT \`FK_70d4af2892b6e1fe1a55bb6a21d\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`model_history\`
        ADD CONSTRAINT \`FK_aa001c1ac63417219634ce3c2c4\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_ddc46c4422bfb550849e09f26de\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_bb02f8dbe3901ee9f90d073afdc\` FOREIGN KEY (\`ownedByUserId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_d50ad68f017b844c9bbf8881a46\` FOREIGN KEY (\`assignedToUserId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`account_user\`
        ADD CONSTRAINT \`FK_6d0a53b1f1f3e4b65f4027c8957\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`super_admin_token\`
        ADD CONSTRAINT \`FK_24b88ac44f0fc1052a8233af508\` FOREIGN KEY (\`userId\`) REFERENCES \`super_admin\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`super_admin_token\` DROP FOREIGN KEY \`FK_24b88ac44f0fc1052a8233af508\``);
    await queryRunner.query(`ALTER TABLE \`account_user\` DROP FOREIGN KEY \`FK_6d0a53b1f1f3e4b65f4027c8957\``);
    await queryRunner.query(`ALTER TABLE \`deal\` DROP FOREIGN KEY \`FK_d50ad68f017b844c9bbf8881a46\``);
    await queryRunner.query(`ALTER TABLE \`deal\` DROP FOREIGN KEY \`FK_bb02f8dbe3901ee9f90d073afdc\``);
    await queryRunner.query(`ALTER TABLE \`deal\` DROP FOREIGN KEY \`FK_ddc46c4422bfb550849e09f26de\``);
    await queryRunner.query(`ALTER TABLE \`model_history\` DROP FOREIGN KEY \`FK_aa001c1ac63417219634ce3c2c4\``);
    await queryRunner.query(`ALTER TABLE \`deal_dictionary\` DROP FOREIGN KEY \`FK_70d4af2892b6e1fe1a55bb6a21d\``);
    await queryRunner.query(`ALTER TABLE \`assumption\` DROP FOREIGN KEY \`FK_d24254074ba99c7db385ab8648a\``);
    await queryRunner.query(`ALTER TABLE \`assumption\` DROP FOREIGN KEY \`FK_d6ac8e85be9ee1d54e95d228c19\``);
    await queryRunner.query(`ALTER TABLE \`assumption\` DROP FOREIGN KEY \`FK_23a9160164e1007f9410972bfa6\``);
    await queryRunner.query(`ALTER TABLE \`deal_details\` DROP FOREIGN KEY \`FK_c95f383f0c04936c11c20a8fc97\``);
    await queryRunner.query(`ALTER TABLE \`document\` DROP FOREIGN KEY \`FK_66abb2bb3ed01f87a42f6eef667\``);
    await queryRunner.query(`ALTER TABLE \`document_data\` DROP FOREIGN KEY \`FK_2ad82a0050fa7377d911869b8bf\``);
    await queryRunner.query(`ALTER TABLE \`account_user_token\` DROP FOREIGN KEY \`FK_f89b846564d5a35854a95535f06\``);
    await queryRunner.query(`DROP INDEX \`IDX_1ce171ef935f892c7f13004f23\` ON \`super_admin\``);
    await queryRunner.query(`DROP TABLE \`super_admin\``);
    await queryRunner.query(`DROP TABLE \`super_admin_token\``);
    await queryRunner.query(`DROP TABLE \`account\``);
    await queryRunner.query(`DROP TABLE \`account_user\``);
    await queryRunner.query(`DROP INDEX \`unique_deal_slug\` ON \`deal\``);
    await queryRunner.query(`DROP TABLE \`deal\``);
    await queryRunner.query(`DROP TABLE \`model_history\``);
    await queryRunner.query(`DROP INDEX \`REL_70d4af2892b6e1fe1a55bb6a21\` ON \`deal_dictionary\``);
    await queryRunner.query(`DROP TABLE \`deal_dictionary\``);
    await queryRunner.query(`DROP INDEX \`REL_d24254074ba99c7db385ab8648\` ON \`assumption\``);
    await queryRunner.query(`DROP TABLE \`assumption\``);
    await queryRunner.query(`DROP INDEX \`REL_c95f383f0c04936c11c20a8fc9\` ON \`deal_details\``);
    await queryRunner.query(`DROP TABLE \`deal_details\``);
    await queryRunner.query(`DROP TABLE \`document\``);
    await queryRunner.query(`DROP INDEX \`REL_2ad82a0050fa7377d911869b8b\` ON \`document_data\``);
    await queryRunner.query(`DROP TABLE \`document_data\``);
    await queryRunner.query(`DROP TABLE \`account_user_token\``);
  }
}
