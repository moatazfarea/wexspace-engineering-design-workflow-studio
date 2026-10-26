"""Bounded handoff from vision decision to injected provider tool.
Production wiring remains unverified; no auto-purchase or state mutation.
"""
def dispatch(perception, *, confirmed, assumptions, calculate):
    decision=perception.get("decision")
    if decision!="CALL_ACTUAL_QUANTITY_TOOL":
        return {"status":"NEEDS_INPUT","action":decision,"reason":perception.get("reason")}
    if not confirmed:
        return {"status":"NEEDS_HUMAN_CONFIRMATION","action":"CONFIRM_EXTRACTED_DIMENSIONS"}
    length=perception.get("length_m")
    width=perception.get("width_m")
    if not all(isinstance(v,(int,float)) and 0<v<=1000 for v in (length,width)):
        return {"status":"REJECTED","reason":"invalid_dimensions"}
    if assumptions.get("includeCeiling") is not False:
        return {"status":"REJECTED","reason":"REQUIREMENT_CONFLICT"}
    room={**assumptions,"length":length,"width":width}
    result=calculate(room=room)
    return {"status":"CALCULATION_TOOL_RETURNED","action":"calculate_room_quantities",
            "room":room,"provider_result":result}
