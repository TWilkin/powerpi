import { Column, DataType, Index, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "mqtt",
    timestamps: false,
})
export default class MqttModel extends Model<MqttModel> {
    @PrimaryKey
    @Index({
        order: "ASC",
    })
    @Column(DataType.STRING)
    type!: string;

    @PrimaryKey
    @Index({
        order: "ASC",
    })
    @Column(DataType.STRING)
    entity!: string;

    @PrimaryKey
    @Index({
        order: "ASC",
    })
    @Column(DataType.STRING)
    action!: string;

    @PrimaryKey
    @Index({
        order: "DESC",
    })
    @Column(DataType.DATE)
    timestamp!: Date;

    @Column(DataType.JSON)
    message!: object;
}
