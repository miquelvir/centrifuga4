import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import {Skeleton} from "@material-ui/lab";
import React from "react";

export const IconButtonSkeleton = ({...props}) => {
    return <Skeleton {...props} variant="circle">
                <IconButton><PersonAddIcon /></IconButton>
          </Skeleton>
}