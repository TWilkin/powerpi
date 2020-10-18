import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "mqtt",
    timestamps: false
})
export default class MqttModel extends Model<MqttModel> {
    @PrimaryKey
    @Column(DataType.STRING)
    type!: string;

    @PrimaryKey
    @Column(DataType.STRING)
    entity!: string;

    @PrimaryKey
    @Column(DataType.STRING)
    action!: string;

    @PrimaryKey
    @Column(DataType.DATE)
    timestamp!: Date;

    @Column(DataType.JSON)
    message!: object;
}
