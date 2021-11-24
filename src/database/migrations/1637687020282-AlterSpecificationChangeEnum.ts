import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterSpecificationChangeEnum1637687020282 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("statements", "type", new TableColumn({
          name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw', 'sent_transfer', 'received_transfer']
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("statements", "type", new TableColumn({
          name: 'type',
          type: 'enum',
          enum: ['deposit', 'withdraw']
        }))
    }

}
