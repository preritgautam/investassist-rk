import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndexToCGFields1709136943635 implements MigrationInterface {
  name = 'AddUniqueIndexToCGFields1709136943635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account_user\`
        ADD UNIQUE INDEX \`IDX_7b99766f2c964af844f9bdac40\` (\`clikGatewayId\`)`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD UNIQUE INDEX \`IDX_2f664bc99a4a0d76684f98ea6a\` (\`clikGatewayId\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP INDEX \`IDX_2f664bc99a4a0d76684f98ea6a\``);
    await queryRunner.query(`ALTER TABLE \`account_user\`
        DROP INDEX \`IDX_7b99766f2c964af844f9bdac40\``);
  }
}
