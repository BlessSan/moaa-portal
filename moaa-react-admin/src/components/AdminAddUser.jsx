import { RadioControl } from "@wordpress/components";
import { useState } from "@wordpress/element";

export default function AdminAddUser() {
  const [option, setOption] = useState("partner");

  const radioOptions = [
    { description: "Default user account", label: "Default", value: "default" },
    { description: "Partner account", label: "Partner", value: "partner" },
  ];

  return (
    <label for="moaa_user_type">
      <RadioControl
        name="moaa_user_type"
        label="User type"
        selected={option}
        options={radioOptions}
        onChange={(value) => setOption(value)}
      />
    </label>
  );
}
