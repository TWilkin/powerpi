/** Generate the tooltip id for the given floor and room.
 * @param floor The name of the floor this room is on.
 * @param room The name of the room.
 * @return The unique id for that room's tooltip.
 */
export default function generateRoomTooltipId(floor: string, room: string) {
    return `room-tooltip-${floor}-${room}`;
}
