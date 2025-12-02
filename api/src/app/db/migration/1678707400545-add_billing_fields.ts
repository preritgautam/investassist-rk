import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBillingFields1678707400545 implements MigrationInterface {
  name = 'addBillingFields1678707400545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account_user\`
        ADD \`isRootUser\` tinyint NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`stripeCustomerId\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`stripeSubscriptionId\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`planId\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`stripePlanId\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`trialStartedOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`trialCancelledOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`trialEndedOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`currentSubscriptionStartedOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`currentSubscriptionEndsOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`currentSubscriptionCancelledOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`markedForCancellationOn\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`oneTrialAvailed\` tinyint NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`lastInvoiceFailed\` tinyint NULL`);
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`lastInvoiceUrl\` varchar(2048) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`lastInvoiceUrl\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`lastInvoiceFailed\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`oneTrialAvailed\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`markedForCancellationOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`currentSubscriptionCancelledOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`currentSubscriptionEndsOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`currentSubscriptionStartedOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`trialEndedOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`trialCancelledOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`trialStartedOn\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`stripePlanId\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`planId\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`stripeSubscriptionId\``);
    await queryRunner.query(`ALTER TABLE \`account\`
        DROP COLUMN \`stripeCustomerId\``);
    await queryRunner.query(`ALTER TABLE \`account_user\`
        DROP COLUMN \`isRootUser\``);
  }
}
