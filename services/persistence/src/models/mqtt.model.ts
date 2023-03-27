import { Column, DataType, Index, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: "mqtt",
    timestamps: false,
})
export default class MqttModel extends Model<MqttModel> {
    @PrimaryKey
    @Index({
        name: "IDX_mqtt_type",
    })
    @Column(DataType.STRING)
    type!: string;

    @PrimaryKey
    @Index({
        name: "IDX_mqtt_entity",
    })
    @Column(DataType.STRING)
    entity!: string;

    @PrimaryKey
    @Index({
        name: "IDX_mqtt_action",
    })
    @Column(DataType.STRING)
    action!: string;

    @PrimaryKey
    @Index({
        name: "IDX_mqtt_timestamp",
        order: "DESC",
    })
    @Column(DataType.DATE)
    timestamp!: Date;

    @Column(DataType.JSON)
    message!: object;
}
