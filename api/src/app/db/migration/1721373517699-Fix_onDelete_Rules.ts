import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOnDeleteRules1721373517699 implements MigrationInterface {
  name = 'FixOnDeleteRules1721373517699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`document\`
        DROP FOREIGN KEY \`FK_66abb2bb3ed01f87a42f6eef667\``);
    await queryRunner.query(`ALTER TABLE \`deal\`
        DROP FOREIGN KEY \`FK_bb02f8dbe3901ee9f90d073afdc\``);
    await queryRunner.query(`ALTER TABLE \`deal\`
        DROP FOREIGN KEY \`FK_d50ad68f017b844c9bbf8881a46\``);
    await queryRunner.query(`ALTER TABLE \`deal\`
        DROP FOREIGN KEY \`FK_ddc46c4422bfb550849e09f26de\``);
    await queryRunner.query(`ALTER TABLE \`account_user\`
        DROP FOREIGN KEY \`FK_6d0a53b1f1f3e4b65f4027c8957\``);
    await queryRunner.query(`ALTER TABLE \`document\`
        ADD CONSTRAINT \`FK_66abb2bb3ed01f87a42f6eef667\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_ddc46c4422bfb550849e09f26de\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_bb02f8dbe3901ee9f90d073afdc\` FOREIGN KEY (\`ownedByUserId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_d50ad68f017b844c9bbf8881a46\` FOREIGN KEY (\`assignedToUserId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`account_user\`
        ADD CONSTRAINT \`FK_6d0a53b1f1f3e4b65f4027c8957\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account_user\`
        DROP FOREIGN KEY \`FK_6d0a53b1f1f3e4b65f4027c8957\``);
    await queryRunner.query(`ALTER TABLE \`deal\`
        DROP FOREIGN KEY \`FK_d50ad68f017b844c9bbf8881a46\``);
    await queryRunner.query(`ALTER TABLE \`deal\`
        DROP FOREIGN KEY \`FK_bb02f8dbe3901ee9f90d073afdc\``);
    await queryRunner.query(`ALTER TABLE \`deal\`
        DROP FOREIGN KEY \`FK_ddc46c4422bfb550849e09f26de\``);
    await queryRunner.query(`ALTER TABLE \`document\`
        DROP FOREIGN KEY \`FK_66abb2bb3ed01f87a42f6eef667\``);
    await queryRunner.query(`ALTER TABLE \`account_user\`
        ADD CONSTRAINT \`FK_6d0a53b1f1f3e4b65f4027c8957\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_ddc46c4422bfb550849e09f26de\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_d50ad68f017b844c9bbf8881a46\` FOREIGN KEY (\`assignedToUserId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD CONSTRAINT \`FK_bb02f8dbe3901ee9f90d073afdc\` FOREIGN KEY (\`ownedByUserId\`) REFERENCES \`account_user\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`document\`
        ADD CONSTRAINT \`FK_66abb2bb3ed01f87a42f6eef667\` FOREIGN KEY (\`dealId\`) REFERENCES \`deal\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
