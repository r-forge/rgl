axis3d <- function (edge, at = NULL, labels = TRUE, tick = TRUE, line = 0,
    pos = NULL, ...)
{
        save <- par3d(skipRedraw = TRUE, ignoreExtent = TRUE, ...)
        on.exit(par3d(save))
        
        ranges <- par3d('bbox')
        ranges <- list(xlim=ranges[1:2], ylim=ranges[3:4], zlim=ranges[5:6])

        ranges$x <- (ranges$xlim - mean(ranges$xlim))*1.03 + mean(ranges$xlim)
        ranges$y <- (ranges$ylim - mean(ranges$ylim))*1.03 + mean(ranges$ylim)
        ranges$z <- (ranges$zlim - mean(ranges$zlim))*1.03 + mean(ranges$zlim)

	edge <- c(strsplit(edge, '')[[1]], '-', '-')[1:3]
	coord <- match(toupper(edge[1]), c('X', 'Y', 'Z')) 
	
	# Put the sign in the appropriate entry of edge
	if (coord == 2) edge[1] <- edge[2]
	else if (coord == 3) edge[1:2] <- edge[2:3]
	
        range <- ranges[[coord]]

        if (is.null(at)) {
                at <- pretty(range)
                at <- at[at >= range[1] & at <= range[2]]
        }

        if (is.logical(labels)) {
                if (labels) labels <- as.character(at)
                else labels <- NA
        }

        if (is.null(pos)) {
                pos <- matrix(NA,3,length(at))
                if (edge[1] == '+') pos[1,] <- ranges$x[2]
                else pos[1,] <- ranges$x[1]
                if (edge[2] == '+') pos[2,] <- ranges$y[2]
                else pos[2,] <- ranges$y[1]
                if (edge[3] == '+') pos[3,] <- ranges$z[2]
                else pos[3,] <- ranges$z[1]
        }
        else pos <- matrix(pos,3,length(at))
        pos[coord,] <- at
        ticksize <- 0.05*(pos[,1]-c(mean(ranges$x),mean(ranges$y),mean(ranges$z)))
        ticksize[coord] <- 0

        x <- c(pos[1,1],pos[1,length(at)])
        y <- c(pos[2,1],pos[2,length(at)])
        z <- c(pos[3,1],pos[3,length(at)])
        if (tick) {
                x <- c(x,as.double(rbind(pos[1,],pos[1,]+ticksize[1])))
                y <- c(y,as.double(rbind(pos[2,],pos[2,]+ticksize[2])))
                z <- c(z,as.double(rbind(pos[3,],pos[3,]+ticksize[3])))
        }
        segments3d(x,y,z)
        if (!all(is.na(labels)))
                text3d(pos[1,]+3*ticksize[1],
                       pos[2,]+3*ticksize[2],
                       pos[3,]+3*ticksize[3],
                       labels)
}

axes3d <- function(edges=c('x','y','z'),labels=TRUE,
                   tick=TRUE, ...)
{
    save <- par3d(skipredraw = TRUE, ignoreExtent = TRUE, ...)
    on.exit(par3d(save))
    for (e in edges)
        axis3d(e,labels=labels,tick=tick)
}

box3d <- function(...)
{
        save <- par3d(ignoreextent = TRUE, ...)
        on.exit(par3d(save))
        ranges <- par3d('bbox')
        ranges <- list(xlim=ranges[1:2], ylim=ranges[3:4], zlim=ranges[5:6])

        ranges$x <- (ranges$xlim - mean(ranges$xlim))*1.03 + mean(ranges$xlim)
        ranges$y <- (ranges$ylim - mean(ranges$ylim))*1.03 + mean(ranges$ylim)
        ranges$z <- (ranges$zlim - mean(ranges$zlim))*1.03 + mean(ranges$zlim)
        x <- c(rep(ranges$x[1],8),rep(ranges$x,4),rep(ranges$x[2],8))
        y <- c(rep(ranges$y,2),rep(ranges$y,c(2,2)),rep(ranges$y,c(4,4)),
               rep(ranges$y,2),rep(ranges$y,c(2,2)))
        z <- c(rep(ranges$z,c(2,2)),rep(ranges$z,2),rep(rep(ranges$z,c(2,2)),2),
               rep(ranges$z,c(2,2)),rep(ranges$z,2))
        segments3d(x,y,z)
}

mtext3d <- function(text, edge, line = 0, at = NULL, pos = NA, handle = ThreeDHandle, ...)
{
        save <- par3d(ignoreExtent = TRUE, "cex", ..., handle=handle)
        on.exit(par3d(save, handle = handle))
		cex <- list(...)$cex
		if (is.null(cex)) cex <- save$cex

        ranges <- par3d('xlim','ylim','zlim',handle=handle)

        ranges$x <- (ranges$xlim - mean(ranges$xlim))*1.03 + mean(ranges$xlim)
        ranges$y <- (ranges$ylim - mean(ranges$ylim))*1.03 + mean(ranges$ylim)
        ranges$z <- (ranges$zlim - mean(ranges$zlim))*1.03 + mean(ranges$zlim)

        if      (length(grep('[xX]',edge)) == 0) coord <- 1
        else if (length(grep('[yY]',edge)) == 0) coord <- 2
        else coord <- 3

        range <- ranges[[coord]]

        if (is.null(at)) at <- mean(range)

        newlen <- max(length(text),length(line),length(at))
        text <- rep(text, len = newlen)
        line <- rep(line, len = newlen)
        at <- rep(at, len = newlen)

        if (all(is.na(pos))) {
                pos <- matrix(NA,3,length(at))
                if (length(grep('X',edge)) == 1) pos[1,] <- ranges$x[2]
                else pos[1,] <- ranges$x[1]
                if (length(grep('Y',edge)) == 1) pos[2,] <- ranges$y[2]
                else pos[2,] <- ranges$y[1]
                if (length(grep('Z',edge)) == 1) pos[3,] <- ranges$z[2]
                else pos[3,] <- ranges$z[1]
        }
        else pos <- matrix(pos,3,length(at))
        pos[coord,] <- at
        ticksize <- 0.05*cex*(pos[,1]-c(mean(ranges$x),mean(ranges$y),mean(ranges$z)))
        ticksize[coord] <- 0

        invisible(text3d(pos[1,]+3*ticksize[1]*line,
               pos[2,]+3*ticksize[2]*line,
               pos[3,]+3*ticksize[3]*line,
               text,handle=handle))
}   

title3d <- function (main = NULL, sub = NULL, xlab = NULL, ylab = NULL, 
    zlab = NULL, line = NA, handle = ThreeDHandle, ...) 
{
        save <- par3d(skipredraw = TRUE, ignoreExtent = TRUE, ...)
        on.exit(par3d(save, handle = handle))
        g <- integer(0)
        if (!is.null(main)) {
            aline <- ifelse(is.na(line), 2, line)
            g <- c(g, mtext3d(main, 'YZ', line = aline, handle = handle))
        }
        if (!is.null(sub)) {
            aline <- ifelse(is.na(line), 3, line)
            g <- c(g, mtext3d(sub, 'yz', line = aline, handle = handle))
        }
        if (!is.null(xlab)) {
            aline <- ifelse(is.na(line), 2, line)
            g <- c(g, mtext3d(xlab, 'yz', line = aline, handle = handle))
        }
        if (!is.null(ylab)) {
            aline <- ifelse(is.na(line), 2, line)
            g <- c(g, mtext3d(ylab, 'xz', line = aline, handle = handle))
        }
        if (!is.null(zlab)) {
            aline <- ifelse(is.na(line), 2, line)
            g <- c(g, mtext3d(zlab, 'xy', line = aline, handle = handle))
        }                  
        class(g) <- 'obj3d'
        invisible(g)
}
