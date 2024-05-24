import express from "express";
import { database } from "../../firebase/dbConfig.js";
import { ref, set, push, remove,get } from "../../firebase/dbConfig.js";

const router = express.Router();

router.post("/new-field", async (req, res) => {
  try {
    const request = req.body;
    if (!request) {
      return res
        .status(400)
        .json({ message: "Bad Request: Request body is missing." });
    }
    const areaRef = ref(database, `System/auditInfo/fields/${request.areaKey}`)
    const areaPushKey =await push( ref(database, `System/auditInfo/fields/`))
    const snapshot = await get(areaRef)
    const areaKey = snapshot.exists() ? request.areaKey : areaPushKey.key

    await set(ref(database, `System/auditInfo/fields/${areaKey}`), {
      authorFullname: request.authorFullname,
      authorUsername: request.authorUsername,
      description: request.description,
      requirements: request.requirements
        ? JSON.stringify(request.requirements)
        : [],
      title: request.title,
      pushKey: areaKey,
      timestamp: request.date,
      auditKey: request.auditKey,
      localeType: request.localeType,
      locked: false,
      archived: false
    });

    await remove(
      ref(database, `System/auditInfo/draft/area/${request.areaKey}`)
    );

    const logsPushKey = await push(ref(database, `System/activityLogs/`));
    await set(
      ref(database, `System/activityLogs/${logsPushKey.key}`),
      {
        title: `${request.authorFullname} created new area :(${request.title})`,
        date: request.date,
        pushKey: logsPushKey.key
      }
    );

    if (request.indicators && request.indicators.length > 0) {
      const indicatorPath = ref(
        database,
        `System/auditInfo/fields/${areaKey}/indicators`
      );
      for (let indicator of request.indicators) {
        const indicatorPushKey = await push(indicatorPath);
        await set(
          ref(
            database,
            `System/auditInfo/fields/${areaKey}/indicators/${indicatorPushKey.key}`
          ),
          {
            dataInputMethod: {
              type: indicator?.dataInputMethod?.type,
              value: JSON.stringify(
                indicator?.dataInputMethod?.value || "null"
              ),
            },
            mov: indicator.mov,
            query: indicator.query,
            type: indicator.type,
            id: indicator.id,
            pushKey: indicatorPushKey.key,
            path: `${areaKey}/indicators/${indicatorPushKey.key}`,
            status: false,
            stage:indicator.stage
          }
        );

        if (indicator.subIndicator && indicator.subIndicator.length > 0) {
          const subIndicatorPath = ref(
            database,
            `System/auditInfo/fields/${areaKey}/indicators/${indicatorPushKey.key}/subIndicator`
          );
          for (let subIndicator of indicator.subIndicator) {
            const subIndicatorPushKey = await push(subIndicatorPath);
            await set(
              ref(
                database,
                `System/auditInfo/fields/${areaKey}/indicators/${indicatorPushKey.key}/subIndicator/${subIndicatorPushKey.key}`
              ),
              {
                dataInputMethod: {
                  type: subIndicator?.dataInputMethod?.type,
                  value: JSON.stringify(
                    subIndicator?.dataInputMethod?.value || "null"
                  ),
                },
                mov: subIndicator.mov,
                query: subIndicator.query,
                type: subIndicator.type,
                id: subIndicator.id,
                pushKey: subIndicatorPushKey.key,
                path: `${areaKey}/indicators/${indicatorPushKey.key}/subIndicator/${subIndicatorPushKey.key}`,
                status: false,
                stage: subIndicator.stage
              }
            );

            if (
              subIndicator.subIndicator &&
              subIndicator.subIndicator.length > 0
            ) {
              const subIndicatorSecPath = ref(
                database,
                `System/auditInfo/fields/${areaKey}/indicators/${indicatorPushKey.key}/subIndicator/${subIndicatorPushKey.key}/subIndicator`
              );
              for (let subIndicatorSec of subIndicator.subIndicator) {
                const subIndicatorSecPushKey = await push(subIndicatorSecPath);
                await set(
                  ref(
                    database,
                    `System/auditInfo/fields/${areaKey}/indicators/${indicatorPushKey.key}/subIndicator/${subIndicatorPushKey.key}/subIndicator/${subIndicatorSecPushKey.key}`
                  ),
                  {
                    dataInputMethod: {
                      type: subIndicatorSec?.dataInputMethod?.type,
                      value: JSON.stringify(
                        subIndicatorSec?.dataInputMethod?.value || "null"
                      ),
                    },
                    mov: subIndicatorSec.mov,
                    query: subIndicatorSec.query,
                    type: subIndicatorSec.type,
                    id: subIndicatorSec.id,
                    pushKey: subIndicatorSecPushKey.key,
                    path: `${areaKey}/indicators/${indicatorPushKey.key}/subIndicator/${subIndicatorPushKey.key}/subIndicator/${subIndicatorSecPushKey.key}`,
                    status: false,
                    stage: subIndicatorSec.stage
                  }
                );
              }
            }
          }
        }
      }
    }
    res.status(200).json({ message: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Sorry something went wrong.: ${error.message}` });
  }
});

export default router;
