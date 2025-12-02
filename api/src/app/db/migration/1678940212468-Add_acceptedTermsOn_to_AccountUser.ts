import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAcceptedTermsOnToAccountUser1678940212468 implements MigrationInterface {
  name = 'AddAcceptedTermsOnToAccountUser1678940212468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account_user\`
        ADD \`acceptedTermsOn\` datetime NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account_user\`
        DROP COLUMN \`acceptedTermsOn\``);
  }
}
