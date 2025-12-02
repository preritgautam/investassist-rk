import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountTemplateTable1720509978725 implements MigrationInterface {
  name = 'AddAccountTemplateTable1720509978725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`account_template\`
                             (
                                 \`id\`               varchar(36)  NOT NULL,
                                 \`name\`             varchar(255) NOT NULL,
                                 \`chartOfAccount\`   json         NOT NULL,
                                 \`s3FilePath\`       varchar(255) NOT NULL,
                                 \`originalFileName\` varchar(255) NOT NULL,
                                 \`accountId\`        varchar(36)  NULL,
                                 PRIMARY KEY (\`id\`)
                             ) ENGINE = InnoDB`);
    await queryRunner.query(`ALTER TABLE \`account_template\`
        ADD CONSTRAINT \`FK_a3662a32909305feb1e4275be72\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account_template\`
        DROP FOREIGN KEY \`FK_a3662a32909305feb1e4275be72\``);
    await queryRunner.query(`DROP TABLE \`account_template\``);
  }
}
