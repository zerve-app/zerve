import {
  createZAction,
  createZContainer,
  createZGettableGroup,
  createZStatic,
  StringSchema,
  RequestError,
} from "@zerve/core";
import { ChildrenListSchema } from "@zerve/data";
import { DigitalOcean } from "digitalocean-js";

export type ZDigitalOcean = ReturnType<typeof createZDigitalOcean>;

const CreateDropletSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    region: { enum: ["nyc3", "sfo2"] },
  },
  additionalProperties: false,
} as const;

export function createZDigitalOcean(config: { apiKey: string }) {
  const client = new DigitalOcean(config.apiKey);
  return createZContainer({
    createDroplet: createZAction(
      CreateDropletSchema,
      StringSchema,
      async ({ region, label }) => {
        const resultDroplet = await client.droplets.createNewDroplet({
          name: label,
          region,
          size: "s-1vcpu-1gb",
          image: "ubuntu-16-04-x64",
          ssh_keys: ["hahha lmfao"],
          backups: false,
          ipv6: true,
          user_data: null,
          private_networking: null,
          volumes: null,
          tags: ["lol"],
        });
        console.log("did create droplet", resultDroplet);
        return "soon";
      }
    ),
    droplets: createZGettableGroup(
      ChildrenListSchema,
      (dropletId) => {
        return createZContainer({
          id: createZStatic(dropletId),
        });
      },
      async () => {
        const droplets = await client.droplets.getAllDroplets();
        console.log("fetched droplets", droplets);
        return {
          children: droplets.map((d) => {
            console.log("LOL droplet", d);
            return d.id;
          }),
        };
      }
    ),
  });
}
