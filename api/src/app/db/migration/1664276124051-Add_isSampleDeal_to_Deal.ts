import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSampleDealToDeal1664276124051 implements MigrationInterface {
  name = 'AddIsSampleDealToDeal1664276124051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`deal\`
        ADD \`isSampleDeal\` tinyint NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`deal\` DROP COLUMN \`isSampleDeal\``);
  }
}
